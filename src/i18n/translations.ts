import { Translations } from '../types/i18n';

export const translations: Record<string, Translations> = {
  en: {
    header: {
      title: 'Task Management',
      subtitle: 'Add columns dynamically and move tasks between them',
      howToUse: 'How to use',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      exportData: 'Export all data',
      importData: 'Import data',
    },
    column: {
      title: 'Column',
      addColumnLeft: 'Add column to the left',
      addColumnRight: 'Add column to the right',
      copyTasks: 'Copy all tasks to clipboard',
      deleteColumn: 'Delete column (tasks will be copied to clipboard first)',
      addTasks: 'Add Tasks (Ctrl+Enter)',
      addTasksShortcut: 'Add Tasks',
      noTasks: 'No tasks yet. Add some tasks above!',
      placeholder: 'Type or paste tasks here... (each line becomes a task)',
    },
    task: {
      moveLeft: 'Move left',
      moveRight: 'Move right',
      deleteTask: 'Delete task',
    },
    instructions: {
      title: 'How to use:',
      items: [
        'Type tasks in any column (each line becomes one task)',
        'Click + buttons to add columns to the left or right',
        'Hover over tasks to see move and delete buttons',
        'Use Ctrl+Enter to quickly add tasks',
        'Copy button copies all column tasks to clipboard',
        'Delete button removes column (tasks copied first)',
        'Export button downloads all your data as a JSON file',
        'Import button loads data from a previously exported file',
      ],
    },
    languages: {
      en: 'English',
      fa: 'فارسی',
    },
    notifications: {
      exportSuccess: 'Data exported successfully!',
      importSuccess: 'Data imported successfully!',
      importError: 'Error importing data. Please check the file format.',
      noDataToExport: 'No data to export. Add some tasks first.',
    },
  },
  fa: {
    header: {
      title: 'مدیریت وظایف',
      subtitle: 'ستون‌ها را به صورت پویا اضافه کنید و وظایف را بین آن‌ها جابجا کنید',
      howToUse: 'نحوه استفاده',
      switchToLight: 'تغییر به حالت روشن',
      switchToDark: 'تغییر به حالت تاریک',
      exportData: 'خروجی گرفتن از همه داده‌ها',
      importData: 'وارد کردن داده‌ها',
    },
    column: {
      title: 'ستون',
      addColumnLeft: 'افزودن ستون به سمت چپ',
      addColumnRight: 'افزودن ستون به سمت راست',
      copyTasks: 'کپی همه وظایف در کلیپ‌بورد',
      deleteColumn: 'حذف ستون (ابتدا وظایف کپی می‌شوند)',
      addTasks: 'افزودن وظایف (Ctrl+Enter)',
      addTasksShortcut: 'افزودن وظایف',
      noTasks: 'هنوز وظیفه‌ای وجود ندارد. وظایف خود را در بالا اضافه کنید!',
      placeholder: 'وظایف خود را اینجا تایپ یا پیست کنید... (هر خط یک وظیفه می‌شود)',
    },
    task: {
      moveLeft: 'انتقال به چپ',
      moveRight: 'انتقال به راست',
      deleteTask: 'حذف وظیفه',
    },
    instructions: {
      title: 'نحوه استفاده:',
      items: [
        'وظایف را در هر ستون تایپ کنید (هر خط یک وظیفه می‌شود)',
        'روی دکمه‌های + کلیک کنید تا ستون‌هایی به چپ یا راست اضافه شود',
        'موس را روی وظایف ببرید تا دکمه‌های انتقال و حذف را ببینید',
        'از Ctrl+Enter برای افزودن سریع وظایف استفاده کنید',
        'دکمه کپی همه وظایف ستون را در کلیپ‌بورد کپی می‌کند',
        'دکمه حذف ستون را حذف می‌کند (ابتدا وظایف کپی می‌شوند)',
        'دکمه خروجی همه داده‌های شما را به صورت فایل JSON دانلود می‌کند',
        'دکمه ورودی داده‌ها را از فایل قبلاً خروجی گرفته شده بارگذاری می‌کند',
      ],
    },
    languages: {
      en: 'English',
      fa: 'فارسی',
    },
    notifications: {
      exportSuccess: 'داده‌ها با موفقیت خروجی گرفته شد!',
      importSuccess: 'داده‌ها با موفقیت وارد شد!',
      importError: 'خطا در وارد کردن داده‌ها. لطفاً فرمت فایل را بررسی کنید.',
      noDataToExport: 'داده‌ای برای خروجی وجود ندارد. ابتدا وظایفی اضافه کنید.',
    },
  },
};