import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  isDark: boolean;
  isRTL: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, isDark, isRTL }) => {
  return (
    <div className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success'
        ? isDark ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
        : isDark ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
    }`}>
      {message}
    </div>
  );
};
