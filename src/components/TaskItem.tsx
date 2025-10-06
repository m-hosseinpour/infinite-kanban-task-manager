import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types/kanban';
import { useI18n } from '../hooks/useI18n';

interface TaskItemProps {
  task: Task;
  columnId: string;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  isDark: boolean;
  onMoveLeft: (taskId: string, columnId: string) => void;
  onMoveRight: (taskId: string, columnId: string) => void;
  onDelete: (taskId: string, columnId: string) => void;
}

export const TaskItem = React.memo<TaskItemProps>(({
  task,
  columnId,
  canMoveLeft,
  canMoveRight,
  isDark,
  onMoveLeft,
  onMoveRight,
  onDelete
}) => {
  const { t, isRTL } = useI18n();

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow duration-200 group`}>
      <div className="flex items-start justify-between">
        <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'} flex-1 leading-relaxed`}>{task.text}</span>
        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          {canMoveLeft && (
            <button
              onClick={() => onMoveLeft(task.id, columnId)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-150`}
              title={isRTL ? t.task.moveRight : t.task.moveLeft}
            >
              <ChevronLeft size={16} className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => onMoveRight(task.id, columnId)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-150`}
              title={isRTL ? t.task.moveLeft : t.task.moveRight}
            >
              <ChevronRight size={16} className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id, columnId)}
            className={`p-1 rounded ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} text-red-500 hover:text-red-600 transition-colors duration-150`}
            title={t.task.deleteTask}
          >
            <span className="text-base">×</span>
          </button>
        </div>
      </div>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';
