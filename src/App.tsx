import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  text: string;
}

interface Column {
  id: string;
  tasks: Task[];
}

function App() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'initial-column',
      tasks: []
    }
  ]);

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
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-gray-800 flex-1 leading-relaxed">{task.text}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {canMoveLeft && (
            <button
              onClick={() => moveTaskLeft(task.id, columnId)}
              className="p-1 rounded hover:bg-gray-100 transition-colors duration-150"
              title="Move left"
            >
              <ChevronLeft size={14} className="text-gray-500" />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => moveTaskRight(task.id, columnId)}
              className="p-1 rounded hover:bg-gray-100 transition-colors duration-150"
              title="Move right"
            >
              <ChevronRight size={14} className="text-gray-500" />
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id, columnId)}
            className="p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-150"
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
      <div className="flex-shrink-0 w-80 bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
        {/* Column Header with Add Buttons */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => addColumnLeft(column.id)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-150 text-gray-600 hover:text-gray-800"
            title="Add column to the left"
          >
            <Plus size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-600">
              Column {index + 1}
            </h3>
            {column.tasks.length > 0 && (
              <button
                onClick={() => copyColumnTasks(column.id)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors duration-150 text-gray-500 hover:text-gray-700"
                title="Copy all tasks to clipboard"
              >
                <Copy size={14} />
              </button>
            )}
            {columns.length > 1 && (
              <button
                onClick={() => deleteColumn(column.id)}
                className="p-1.5 rounded-lg hover:bg-red-100 transition-colors duration-150 text-red-500 hover:text-red-600"
                title="Delete column (tasks will be copied to clipboard first)"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => addColumnRight(column.id)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-150 text-gray-600 hover:text-gray-800"
            title="Add column to the right"
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
            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleAddTasks}
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150 text-sm font-medium"
          >
            Add Tasks (Ctrl+Enter)
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {column.tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Add columns dynamically and move tasks between them
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 pb-6" style={{ minWidth: 'max-content' }}>
          {columns.map((column, index) => (
            <TaskColumn key={column.id} column={column} index={index} />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Type tasks in any column (each line = one task)</li>
          <li>• Click + buttons to add columns</li>
          <li>• Hover over tasks to see move/delete buttons</li>
          <li>• Use Ctrl+Enter to quickly add tasks</li>
        </ul>
      </div>
    </div>
  );
}

export default App;