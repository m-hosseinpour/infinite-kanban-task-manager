import { useState, useRef } from 'react';
import { useI18n, useAuth, useUserData } from './hooks';
import { AuthModal, Header, Notification, InstructionsModal, TaskColumn } from './components';
import { Column, ExportData } from './types';

function App() {
  const { t, currentLanguage, changeLanguage, isRTL, availableLanguages } = useI18n();
  const { user, loading: authLoading, signOut } = useAuth();
  const { columns, setColumns, loading: dataLoading, saving, saveUserData } = useUserData(user);

  // Store scroll positions for all columns
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());

  // Theme and direction state with localStorage persistence
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Update theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const addColumnLeft = (columnId: string) => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    const newColumn: Column = {
      id: generateId(),
      tasks: []
    };

    setColumns(prev => {
      const newColumns = [...prev];
      newColumns.splice(columnIndex, 0, newColumn);
      if (user) saveUserData(newColumns);
      return newColumns;
    });
  };

  const addColumnRight = (columnId: string) => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    const newColumn: Column = {
      id: generateId(),
      tasks: []
    };

    setColumns(prev => {
      const newColumns = [...prev];
      newColumns.splice(columnIndex + 1, 0, newColumn);
      if (user) saveUserData(newColumns);
      return newColumns;
    });
  };

  const addTasksToColumn = (columnId: string, text: string) => {
    if (!text.trim()) return;

    const lines = text.split('\n').filter(line => line.trim());
    const newTasks = lines.map(line => ({
      id: generateId(),
      text: line.trim()
    }));

    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, ...newTasks] }
          : col
      );
      if (user) saveUserData(newColumns);
      return newColumns;
    });
  };

  const moveTaskLeft = (taskId: string, currentColumnId: string) => {
    const currentColumnIndex = columns.findIndex(col => col.id === currentColumnId);
    if (currentColumnIndex === 0) return; // Already at leftmost column

    const targetColumnId = columns[currentColumnIndex - 1].id;
    moveTask(taskId, currentColumnId, targetColumnId);
  };

  const moveTaskRight = (taskId: string, currentColumnId: string) => {
    const currentColumnIndex = columns.findIndex(col => col.id === currentColumnId);
    if (currentColumnIndex === columns.length - 1) return; // Already at rightmost column

    const targetColumnId = columns[currentColumnIndex + 1].id;
    moveTask(taskId, currentColumnId, targetColumnId);
  };

  const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    setColumns(prev => {
      const newColumns = [...prev];

      // Find the task and remove it from the source column
      const fromColumnIndex = newColumns.findIndex(col => col.id === fromColumnId);
      const taskIndex = newColumns[fromColumnIndex].tasks.findIndex(task => task.id === taskId);
      const task = newColumns[fromColumnIndex].tasks[taskIndex];

      newColumns[fromColumnIndex] = {
        ...newColumns[fromColumnIndex],
        tasks: newColumns[fromColumnIndex].tasks.filter(t => t.id !== taskId)
      };

      // Add the task to the target column
      const toColumnIndex = newColumns.findIndex(col => col.id === toColumnId);
      newColumns[toColumnIndex] = {
        ...newColumns[toColumnIndex],
        tasks: [...newColumns[toColumnIndex].tasks, task]
      };

      if (user) saveUserData(newColumns);
      return newColumns;
    });
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter(task => task.id !== taskId) }
          : col
      );
      if (user) saveUserData(newColumns);
      return newColumns;
    });
  };

  const copyColumnTasks = async (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column || column.tasks.length === 0) return;

    const tasksText = column.tasks.map(task => task.text).join('\n');

    try {
      await navigator.clipboard.writeText(tasksText);
    } catch (err) {
      console.error('Failed to copy tasks:', err);
    }
  };

  const deleteColumn = async (columnId: string) => {
    // Don't delete if it's the last column
    if (columns.length === 1) return;

    // First copy tasks to clipboard if any exist
    await copyColumnTasks(columnId);

    // Then remove the column
    setColumns(prev => {
      const newColumns = prev.filter(col => col.id !== columnId);
      if (user) saveUserData(newColumns);
      return newColumns;
    });
  };

  const exportData = () => {
    // Check if there's any data to export
    const hasData = columns.some(col => col.tasks.length > 0) || columns.length > 1;

    if (!hasData) {
      showNotification(t.importExport.noDataToExport, 'error');
      return;
    }

    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      columns: columns
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `kanban-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(t.importExport.exportSuccess, 'success');
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData: ExportData = JSON.parse(content);

          // Validate the imported data structure
          if (!importedData.columns || !Array.isArray(importedData.columns)) {
            throw new Error('Invalid data format');
          }

          // Validate each column has the required structure
          for (const column of importedData.columns) {
            if (!column.id || !Array.isArray(column.tasks)) {
              throw new Error('Invalid column format');
            }

            // Validate each task has the required structure
            for (const task of column.tasks) {
              if (!task.id || typeof task.text !== 'string') {
                throw new Error('Invalid task format');
              }
            }
          }

          // If validation passes, update the columns
          setColumns(importedData.columns);
          if (user) saveUserData(importedData.columns);
          showNotification(t.importExport.importSuccess, 'success');

        } catch (error) {
          console.error('Import error:', error);
          showNotification(t.importExport.importError, 'error');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleManualSave = async () => {
    if (user && columns) {
      const success = await saveUserData(columns);
      if (success) {
        showNotification(t.auth.saveData + ' ✓', 'success');
      }
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{t.auth.loading}</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          isDark={isDark}
          isRTL={isRTL}
        />
      )}

      {/* Header */}
      <Header
        isDark={isDark}
        isRTL={isRTL}
        user={user}
        saving={saving}
        currentLanguage={currentLanguage}
        availableLanguages={availableLanguages}
        t={t}
        onToggleTheme={toggleTheme}
        onToggleInstructions={() => setShowInstructions(!showInstructions)}
        onLanguageChange={changeLanguage}
        onExport={exportData}
        onImport={importData}
        onSignOut={handleSignOut}
        onShowAuthModal={() => setShowAuthModal(true)}
        onManualSave={handleManualSave}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDark={isDark}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        isDark={isDark}
        isRTL={isRTL}
        t={t}
      />

      {/* Main Content */}
      <div className="p-6 flex-1 overflow-x-auto">
        {/* Loading overlay for data */}
        {dataLoading && user && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
            <div className={`${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-lg p-6 shadow-xl`}>
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span>{t.auth.loadingData}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
          {columns.map((column, index) => (
            <TaskColumn
              key={column.id}
              column={column}
              index={index}
              totalColumns={columns.length}
              isDark={isDark}
              scrollPositionsRef={scrollPositionsRef}
              onAddColumnLeft={addColumnLeft}
              onAddColumnRight={addColumnRight}
              onAddTasks={addTasksToColumn}
              onCopyTasks={copyColumnTasks}
              onDeleteColumn={deleteColumn}
              onMoveTaskLeft={moveTaskLeft}
              onMoveTaskRight={moveTaskRight}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
