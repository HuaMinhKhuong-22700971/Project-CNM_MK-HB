import { useEffect, useState } from "react";

import { getCurrentProfile, login as loginRequest } from "../services/auth.service";
import { clearAuthState, getAuthState, setAuthState, subscribeAuth } from "../store/authStore";

function getRedirectPathByRole(role) {
  const normalizedRole = String(role || "").trim().toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "/admin/dashboard";
  }

  if (normalizedRole === "SALES_STAFF") {
    return "/staff/orders";
  }

  if (normalizedRole === "TECH_STAFF") {
    return "/tech/tickets";
  }

  return "/";
}

export function useAuth() {
  const [authState, setLocalAuthState] = useState(getAuthState());

  useEffect(() => {
    return subscribeAuth(setLocalAuthState);
  }, []);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    const accessToken = response?.data?.accessToken || "";
    const user = response?.data?.user || null;

    if (!accessToken || !user) {
      throw new Error("Login response is invalid");
    }

    setAuthState({
      accessToken,
      user
    });

    return {
      accessToken,
      user,
      redirectPath: getRedirectPathByRole(user.role)
    };
  }

  async function refreshProfile() {
    if (!getAuthState()?.accessToken) {
      return null;
    }

    const response = await getCurrentProfile();
    const user = response?.data || response;
    const current = getAuthState();

    setAuthState({
      accessToken: current.accessToken,
      user
    });

    return user;
  }

  function loginAsDemo() {
    const demoUser = {
      id: 1,
      fullName: "Demo User",
      role: "CUSTOMER"
    };

    setAuthState({
      accessToken: "demo-access-token",
      user: demoUser
    });

    return {
      accessToken: "demo-access-token",
      user: demoUser,
      redirectPath: "/"
    };
  }

  function logout() {
    clearAuthState();
  }

  return {
    authState,
    isAuthenticated: Boolean(authState.accessToken),
    login,
    refreshProfile,
    loginAsDemo,
    logout,
    getRedirectPathByRole
  };
}
