import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Column } from '../types/kanban';
import { useI18n } from '../hooks/useI18n';
import { TaskItem } from './TaskItem';

interface TaskColumnProps {
  column: Column;
  index: number;
  totalColumns: number;
  isDark: boolean;
  scrollPositionsRef: React.MutableRefObject<Map<string, number>>;
  onAddColumnLeft: (columnId: string) => void;
  onAddColumnRight: (columnId: string) => void;
  onAddTasks: (columnId: string, text: string) => void;
  onCopyTasks: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveTaskLeft: (taskId: string, columnId: string) => void;
  onMoveTaskRight: (taskId: string, columnId: string) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  index,
  totalColumns,
  isDark,
  scrollPositionsRef,
  onAddColumnLeft,
  onAddColumnRight,
  onAddTasks,
  onCopyTasks,
  onDeleteColumn,
  onMoveTaskLeft,
  onMoveTaskRight,
  onDeleteTask
}) => {
  const { t, isRTL } = useI18n();
  const [inputText, setInputText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Save scroll position on every scroll event
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        scrollPositionsRef.current.set(column.id, container.scrollTop);
      };
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [column.id, scrollPositionsRef]);

  // Restore scroll position synchronously before paint using useLayoutEffect
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const savedPosition = scrollPositionsRef.current.get(column.id);
      if (savedPosition !== undefined && savedPosition > 0) {
        container.scrollTop = savedPosition;
      }
    }
  }, [column.tasks, column.id, scrollPositionsRef]);

  const handleAddTasks = () => {
    if (inputText.trim()) {
      onAddTasks(column.id, inputText);
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
          onClick={() => onAddColumnLeft(column.id)}
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
              onClick={() => onCopyTasks(column.id)}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'} transition-colors duration-150`}
              title={t.column.copyTasks}
            >
              <Copy size={14} />
            </button>
          )}
          {totalColumns > 1 && (
            <button
              onClick={() => onDeleteColumn(column.id)}
              className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} transition-colors duration-150 text-red-500 hover:text-red-600`}
              title={t.column.deleteColumn}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => onAddColumnRight(column.id)}
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
      <div ref={scrollContainerRef} className="space-y-2 max-h-96 overflow-y-auto">
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
              canMoveRight={index < totalColumns - 1}
              isDark={isDark}
              onMoveLeft={onMoveTaskLeft}
              onMoveRight={onMoveTaskRight}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
