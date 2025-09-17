import { useState, useEffect } from "react";
import api from "../api";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  function login(data) {
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return { user, login, logout };
}
