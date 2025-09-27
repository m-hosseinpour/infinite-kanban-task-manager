import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2, Moon, Sun, Languages, HelpCircle, X } from 'lucide-react';

interface Task {
  id: string;
  text: string;
}

interface Column {
  id: string;
  tasks: Task[];
}

function App() {
  // Theme and direction state with localStorage persistence
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isRTL, setIsRTL] = useState(() => {
    const saved = localStorage.getItem('direction');
    return saved !== 'ltr'; // Default to RTL unless explicitly set to LTR
  });

  const [showInstructions, setShowInstructions] = useState(false);

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'initial-column',
      tasks: []
    }
  ]);

  // Update theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Update direction and save to localStorage
  const toggleDirection = () => {
    const newDirection = !isRTL;
    setIsRTL(newDirection);
    localStorage.setItem('direction', newDirection ? 'rtl' : 'ltr');
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addColumnLeft = (columnId: string) => {
    const columnIndex = columns.findIndex(col => col.id === columnId);
    const newColumn: Column = {
      id: generateId(),
      tasks: []
    };
    
    setColumns(prev => {
      const newColumns = [...prev];
      newColumns.splice(columnIndex, 0, newColumn);
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

    setColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [...col.tasks, ...newTasks] }
          : col
      )
    );
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
      
      return newColumns;
    });
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, tasks: col.tasks.filter(task => task.id !== taskId) }
          : col
      )
    );
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
    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const TaskItem = ({ task, columnId, canMoveLeft, canMoveRight }: {
    task: Task;
    columnId: string;
    canMoveLeft: boolean;
    canMoveRight: boolean;
  }) => (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow duration-200 group`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} flex-1 leading-relaxed`}>{task.text}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {canMoveLeft && (
            <button
              onClick={() => moveTaskLeft(task.id, columnId)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-150`}
              title={isRTL ? "Move right" : "Move left"}
            >
              <ChevronLeft size={14} className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => moveTaskRight(task.id, columnId)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-150`}
              title={isRTL ? "Move left" : "Move right"}
            >
              <ChevronRight size={14} className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id, columnId)}
            className={`p-1 rounded ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} text-red-500 hover:text-red-600 transition-colors duration-150`}
            title="Delete task"
          >
            ×
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
            title={isRTL ? "Add column to the right" : "Add column to the left"}
          >
            <Plus size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Column {index + 1}
            </h3>
            {column.tasks.length > 0 && (
              <button
                onClick={() => copyColumnTasks(column.id)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'} transition-colors duration-150`}
                title="Copy all tasks to clipboard"
              >
                <Copy size={14} />
              </button>
            )}
            {columns.length > 1 && (
              <button
                onClick={() => deleteColumn(column.id)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} transition-colors duration-150 text-red-500 hover:text-red-600`}
                title="Delete column (tasks will be copied to clipboard first)"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => addColumnRight(column.id)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'} transition-colors duration-150`}
            title={isRTL ? "Add column to the left" : "Add column to the right"}
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
            placeholder="Type or paste tasks here... (each line becomes a task)"
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
            Add Tasks (Ctrl+Enter)
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {column.tasks.length === 0 ? (
            <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No tasks yet. Add some tasks above!
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
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Task Management</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add columns dynamically and move tasks between them
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title="How to use"
            >
              <HelpCircle size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={toggleDirection}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={isRTL ? 'Switch to LTR' : 'Switch to RTL'}
            >
              <Languages size={20} />
            </button>
          </div>
        </div>
      </div>

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
            <h4 className={`font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-lg`}>How to use:</h4>
            <ul className={`text-sm space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Type tasks in any column (each line becomes one task)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Click + buttons to add columns to the left or right</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Hover over tasks to see move and delete buttons</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Use Ctrl+Enter to quickly add tasks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Copy button copies all column tasks to clipboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Delete button removes column (tasks copied first)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 overflow-x-auto">
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