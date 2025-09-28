export interface Translations {
  header: {
    title: string;
    subtitle: string;
    howToUse: string;
    switchToLight: string;
    switchToDark: string;
  };
  column: {
    title: string;
    addColumnLeft: string;
    addColumnRight: string;
    copyTasks: string;
    deleteColumn: string;
    addTasks: string;
    addTasksShortcut: string;
    noTasks: string;
    placeholder: string;
  };
  task: {
    moveLeft: string;
    moveRight: string;
    deleteTask: string;
  };
  importExport: {
    export: string;
    import: string;
    exportSuccess: string;
    importSuccess: string;
    importError: string;
    noDataToExport: string;
  };
  instructions: {
    title: string;
    items: string[];
  };
  languages: {
    en: string;
    fa: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    signInDescription: string;
    signUpDescription: string;
    loading: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    saveData: string;
    autoSave: string;
    saving: string;
    loadingData: string;
  };
}