import React from "react";
import Auth from "../auth/Auth";

export function useAuth() {
  return React.useContext(AuthContext);
}

export const AuthContext = React.createContext<Auth>(null!);
