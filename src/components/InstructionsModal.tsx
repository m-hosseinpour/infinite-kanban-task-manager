import React from 'react';
import { X } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isRTL: boolean;
  t: any;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  isRTL,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl p-6 max-w-2xl w-full border relative max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} transition-colors duration-150`}
        >
          <X size={20} />
        </button>
        <h4 className={`font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'} text-lg`}>{t.instructions.title}</h4>
        <ul className={`text-sm space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {t.instructions.items.map((item: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
