import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set((state) => {
        // Only update if the user is different
        if (state.user?.uid !== user?.uid) {
          return { user };
        }
        return state; // No update if user is the same
      }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // unique name
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      }, // or sessionStorage
    }
  )
);
