import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../utils/storage";

let authState = getStoredAuth() || {
  accessToken: "",
  user: null
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(authState));
}

export function getAuthState() {
  return authState;
}

export function setAuthState(nextState) {
  authState = nextState;
  setStoredAuth(authState);
  notify();
}

export function clearAuthState() {
  authState = {
    accessToken: "",
    user: null
  };
  clearStoredAuth();
  notify();
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
