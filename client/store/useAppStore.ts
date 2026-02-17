import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  username: string;
  // Add other user fields as needed
}

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: true, // Default state
      user: null,
      isAuthenticated: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "app-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist these fields
    },
  ),
);
