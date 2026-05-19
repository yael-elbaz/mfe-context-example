declare module 'mfe_tasks/App' {
  const App: React.ComponentType<{ openService?: import('./types/openService').OpenService }>;
  export default App;
}

declare module 'mfe_search_employee/App' {
  const App: React.ComponentType<{
    onSelected?: (idnt: string, personType: import('./types/openService').PersonType) => void;
    objectType?: import('./types/openService').PersonType[] | null;
  }>;
  export default App;
}

declare module 'mfe_employee_portfolio/App' {
  const App: React.ComponentType<{ openService?: import('./types/openService').OpenService }>;
  export default App;
}

declare module 'mfe_digital_objects/Preview' {
  const Preview: React.ComponentType;
  export default Preview;
}

declare module 'mfe_digital_objects/Full' {
  const Full: React.ComponentType;
  export default Full;
}

declare module 'mfe_sherutim/Preview' {
  const Preview: React.ComponentType<{
    openService?: import('./types/openService').OpenService;
    employeeId?: string;
    navigate?: (to: string) => void;
  }>;
  export default Preview;
}

declare module 'mfe_sherutim/Full' {
  const Full: React.ComponentType<{
    openService?: import('./types/openService').OpenService;
    employeeId?: string;
    navigate?: (to: string) => void;
  }>;
  export default Full;
}
