'use client';

import * as React from 'react';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

interface SidebarContextValue {
  state: SidebarState;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setSidebarState: (state: Partial<SidebarState>) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultState?: Partial<SidebarState>;
}

export function SidebarProvider({ children, defaultState = {} }: SidebarProviderProps) {
  const [state, setState] = React.useState<SidebarState>({
    isOpen: true,
    isCollapsed: false,
    ...defaultState,
  });

  const toggleSidebar = React.useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen,
    }));
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isCollapsed: !prevState.isCollapsed,
    }));
  }, []);

  const openSidebar = React.useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOpen: true,
    }));
  }, []);

  const closeSidebar = React.useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOpen: false,
    }));
  }, []);

  const setSidebarState = React.useCallback((newState: Partial<SidebarState>) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  }, []);

  const value = React.useMemo(
    () => ({
      state,
      toggleSidebar,
      toggleCollapse,
      openSidebar,
      closeSidebar,
      setSidebarState,
    }),
    [state, toggleSidebar, toggleCollapse, openSidebar, closeSidebar, setSidebarState]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }

  return context;
}
