import create from "zustand";
import { persist } from "zustand/middleware";

interface useUserStore {
  user: Record<string, string>;
  setUser: (arg) => void;
}

const useUserStore = create<useUserStore>()(
  persist(
    (set) => {
      return {
        user: { loggedIn: null },
        setUser: (user) => {
          set((state) => (state.user = user));
        },
      };
    },
    {
      name: "CURRENT_USER",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
