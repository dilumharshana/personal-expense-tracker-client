// Api end points
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
  EXPENSES: {
    BASE: "/expense",
    DASHBOARD: "/expense/dashboard",
  },
  MASTER_DATA: "/master-data",
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_REACT_APP_API_BASE_URL,
  TIMEOUT: 10000,
} as const;
