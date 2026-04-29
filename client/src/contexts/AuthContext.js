import React, { useContext, useState } from "react";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readUserFromStorage() {
  try {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      const parsed = JSON.parse(stored);
      // Expose MongoDB _id as `uid` so existing code that reads currentUser.uid works
      return { ...parsed, uid: parsed.id };
    }
  } catch (_) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Lazy initializer: reads localStorage SYNCHRONOUSLY on first render.
  // This means currentUser is never null on mount if the user is already logged in.
  const [currentUser, setCurrentUser] = useState(() => readUserFromStorage());

  function refreshUser() {
    const user = readUserFromStorage();
    setCurrentUser(user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    userLoggedIn: !!currentUser,
    userRole: currentUser?.role || null,
    isEmailUser: true,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
