import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2, Moon, Sun, Globe, HelpCircle, X, Download, Upload, LogOut, Save } from 'lucide-react';
import { useI18n } from './hooks/useI18n';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { AuthModal } from './components/AuthModal';

interface Task {
  id: string;
  text: string;
}

interface Column {
  id: string;
  tasks: Task[];
}

interface ExportData {
  version: string;
  exportDate: string;
  columns: Column[];
}

function App() {
  const { t, currentLanguage, changeLanguage, isRTL, availableLanguages } = useI18n();
  const { user, loading: authLoading, signOut } = useAuth();
  const { columns, setColumns, loading: dataLoading, saving, saveUserData } = useUserData(user);

  // Theme and direction state with localStorage persistence
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Update theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setShowLanguageMenu(false);
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
    setShowLanguageMenu(false);
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

  const TaskItem = ({ task, columnId, canMoveLeft, canMoveRight }: {
    task: Task;
    columnId: string;
    canMoveLeft: boolean;
    canMoveRight: boolean;
  }) => (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow duration-200 group`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} flex-1 leading-relaxed`}>{task.text}</span>
        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          {canMoveLeft && (
            <button
              onClick={() => moveTaskLeft(task.id, columnId)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-150`}
              title={isRTL ? t.task.moveRight : t.task.moveLeft}
            >
              <ChevronLeft size={16} className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => moveTaskRight(task.id, columnId)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-150`}
              title={isRTL ? t.task.moveLeft : t.task.moveRight}
            >
              <ChevronRight size={16} className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id, columnId)}
            className={`p-1 rounded ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} text-red-500 hover:text-red-600 transition-colors duration-150`}
            title={t.task.deleteTask}
          >
            <span className="text-base">×</span>
          </button>
        </div>
      </div>
    </div>
  );

  const TaskColumn = ({ column, index }: { column: Column; index: number }) => {
    const [inputText, setInputText] = useState('');

    const handleAddTasks = () => {
      if (inputText.trim()) {
        addTasksToColumn(column.id, inputText);
        setInputText('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleAddTasks();
      }
    };

    return (
      <div className={`flex-shrink-0 w-80 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl border p-4 shadow-sm`}>
        {/* Column Header with Add Buttons */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => addColumnLeft(column.id)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'} transition-colors duration-150`}
            title={isRTL ? t.column.addColumnRight : t.column.addColumnLeft}
          >
            <Plus size={18} />
          </button>

          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.column.title} {index + 1}
            </h3>
            {column.tasks.length > 0 && (
              <button
                onClick={() => copyColumnTasks(column.id)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'} transition-colors duration-150`}
                title={t.column.copyTasks}
              >
                <Copy size={14} />
              </button>
            )}
            {columns.length > 1 && (
              <button
                onClick={() => deleteColumn(column.id)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} transition-colors duration-150 text-red-500 hover:text-red-600`}
                title={t.column.deleteColumn}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => addColumnRight(column.id)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'} transition-colors duration-150`}
            title={isRTL ? t.column.addColumnLeft : t.column.addColumnRight}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Input Area */}
        <div className="mb-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t.column.placeholder}
            className={`w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleAddTasks}
            className={`mt-2 w-full py-2 px-4 rounded-lg transition-colors duration-150 text-sm font-medium ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {t.column.addTasks}
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {column.tasks.length === 0 ? (
            <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.column.noTasks}
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                columnId={column.id}
                canMoveLeft={index > 0}
                canMoveRight={index < columns.length - 1}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success'
            ? isDark ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
            : isDark ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t.header.title}</h1>
              {user && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {saving ? t.auth.saving : t.auth.autoSave}
                  </span>
                </div>
              )}
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.header.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Import/Export Group */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              {user && (
                <button
                  onClick={handleManualSave}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors duration-150 ${
                    saving
                      ? isDark ? 'text-gray-600' : 'text-gray-400'
                      : isDark
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                  title={t.auth.saveData}
                >
                  <Save size={18} />
                </button>
              )}
              <button
                onClick={exportData}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.importExport.export}
              >
                <Download size={18} />
              </button>
              <button
                onClick={importData}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.importExport.import}
              >
                <Upload size={18} />
              </button>
            </div>

            {/* App Controls Group */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={t.header.howToUse}
            >
              <HelpCircle size={18} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={isDark ? t.header.switchToLight : t.header.switchToDark}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.languages[currentLanguage as keyof typeof t.languages]}
              >
                <Globe size={20} />
              </button>
              {showLanguageMenu && (
                <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 z-50 min-w-32`}>
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full px-4 py-2 text-sm text-${isRTL ? 'right' : 'left'} ${
                        currentLanguage === lang
                          ? isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                          : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      } transition-colors duration-150`}
                    >
                      {t.languages[lang as keyof typeof t.languages]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={handleSignOut}
                className={`p-2 rounded-lg transition-colors duration-150 ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
                title={t.auth.signOut}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 bg-blue-600 hover:bg-blue-700 text-white`}
              >
                {t.auth.signIn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDark={isDark}
      />

      {/* Instructions Popover */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl p-6 max-w-md w-full border relative`}>
            <button
              onClick={() => setShowInstructions(false)}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} transition-colors duration-150`}
            >
              <X size={20} />
            </button>
            <h4 className={`font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-lg`}>{t.instructions.title}</h4>
            <ul className={`text-sm space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.instructions.items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 overflow-x-auto">
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

        {/* Click outside to close language menu */}
        {showLanguageMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLanguageMenu(false)}
          />
        )}
        <div className="flex gap-6 pb-6" style={{ minWidth: 'max-content' }}>
          {columns.map((column, index) => (
            <TaskColumn key={column.id} column={column} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
