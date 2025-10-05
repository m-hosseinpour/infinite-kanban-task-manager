export interface Task {
  id: string;
  text: string;
}

export interface Column {
  id: string;
  tasks: Task[];
}

export interface ExportData {
  version: string;
  exportDate: string;
  columns: Column[];
}
