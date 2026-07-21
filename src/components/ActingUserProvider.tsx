"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ActingUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ActingUserContextValue = {
  users: ActingUser[];
  actingUser: ActingUser | null;
  setActingUserId: (id: string) => void;
  loading: boolean;
};

const ActingUserContext = createContext<ActingUserContextValue | null>(null);

const STORAGE_KEY = "actingUserId";

export function ActingUserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<ActingUser[]>([]);
  const [actingUserId, setActingUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to load users");
        const data: ActingUser[] = await response.json();
        setUsers(data);

        const stored = localStorage.getItem(STORAGE_KEY);
        const initialId =
          stored && data.some((user) => user.id === stored)
            ? stored
            : data[0]?.id ?? null;
        setActingUserIdState(initialId);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const setActingUserId = useCallback((id: string) => {
    setActingUserIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const actingUser = users.find((user) => user.id === actingUserId) ?? null;

  return (
    <ActingUserContext.Provider
      value={{ users, actingUser, setActingUserId, loading }}
    >
      {children}
    </ActingUserContext.Provider>
  );
}

export function useActingUser() {
  const context = useContext(ActingUserContext);
  if (!context) {
    throw new Error("useActingUser must be used within ActingUserProvider");
  }
  return context;
}
