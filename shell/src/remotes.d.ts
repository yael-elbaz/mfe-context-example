declare module 'mfe_tasks/App' {
  const App: React.ComponentType<{ openService?: import('./types/openService').OpenService }>;
  export default App;
}

declare module 'mfe_search_employee/App' {
  const App: React.ComponentType<{
    onSelected?: (idnt: string, personType: import('./types/openService').PersonType) => void;
    objectType?: import('./types/openService').PersonType[] | null;
    placeholder?: string;
  }>;
  export default App;
}

declare module 'mfe_employee_portfolio/App' {
  const App: React.ComponentType<{
    extendedTabDataUrl?: string | null;
    selectedActiveTab?: number;
    /** קצה שמאל של שורה 1 (RTL): כפתור החלפת עובד */
    headerStart?: React.ReactNode;
    /** קצה ימין של שורה 1 (RTL): פרטי הזיהוי */
    headerEnd?: React.ReactNode;
  }>;
  export default App;
}

declare module 'mfe_digital_objects/Preview' {
  const Preview: React.ComponentType<{
    openService?: import('./types/openService').OpenService;
    employeeId?: string;
    onShowAll?: (state?: unknown) => void;
    onFocusItem?: (id: string, iframeUrl?: string) => void;
    search?: string;
    onSearchChange?: (value: string) => void;
  }>;
  export default Preview;
}

declare module 'mfe_digital_objects/Full' {
  const Full: React.ComponentType<{
    openService?: import('./types/openService').OpenService;
    employeeId?: string;
    backToPreview?: () => void;
    onFocusItem?: (id: string, iframeUrl?: string) => void;
    previewState?: unknown;
    search?: string;
    onSearchChange?: (value: string) => void;
  }>;
  export default Full;
}

declare module 'mfe_sherutim/Preview' {
  const Preview: React.ComponentType<{
    openService?: import('./types/openService').OpenService;
    employeeId?: string;
    objectType?: import('./types/openService').PersonType | null;
    onShowAll?: () => void;
  }>;
  export default Preview;
}

declare module 'mfe_sherutim/Full' {
  const Full: React.ComponentType<{
    openService?: import('./types/openService').OpenService;
    employeeId?: string;
    objectType?: import('./types/openService').PersonType | null;
    navigate?: (to: string) => void;
    backToPreview?: () => void;
  }>;
  export default Full;
}
