# Infinite Kanban Task Manager

A flexible, infinite-column Kanban board for task management with cloud sync capabilities.

🔗 **Live Demo**: [https://infinite-kanban-task.netlify.app/](https://infinite-kanban-task.netlify.app/)

## Features

- ✨ **Infinite Columns**: Add unlimited columns dynamically to organize your workflow
- 📝 **Quick Task Entry**: Add multiple tasks at once (each line becomes a task)
- ⚡ **Keyboard Shortcuts**: Use `Ctrl+Enter` to quickly add tasks
- 🔄 **Task Movement**: Move tasks between columns with arrow buttons
- 💾 **Import/Export**: Backup and restore your data via JSON files
- ☁️ **Cloud Sync**: Sign in to automatically sync tasks across devices
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🌍 **Multi-language**: Supports English and Persian (فارسی)
- 📋 **Clipboard Integration**: Copy column tasks to clipboard
- 💻 **Local Storage**: Data persists locally even without an account

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Development**: Initially built with [bolt.new](https://bolt.new), continued with [Windsurf](https://codeium.com/windsurf)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for cloud sync features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/m-hosseinpour/infinite-kanban-task-manager.git
cd infinite-kanban-task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Add Tasks**: Type tasks in the textarea (one per line) and press `Ctrl+Enter` or click the button
2. **Add Columns**: Click the `+` buttons on either side of a column to add new columns
3. **Move Tasks**: Hover over tasks and use arrow buttons to move them between columns
4. **Copy Tasks**: Click the copy button to copy all tasks in a column to clipboard
5. **Delete Column**: Click the delete button (tasks are copied to clipboard first)
6. **Export Data**: Click the download icon to save all data as JSON
7. **Import Data**: Click the upload icon to restore data from a JSON file
8. **Sign In**: Create an account to enable automatic cloud sync across devices

## Supabase Setup

To enable cloud sync, set up a Supabase project:

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the following SQL to create the required table:

```sql
CREATE TABLE user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);
```

3. Add your Supabase URL and anon key to `.env`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
