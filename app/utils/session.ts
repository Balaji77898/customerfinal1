const SESSION_KEY = "session";

export const getSession = () => {
  if (typeof window === "undefined") return null;

  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveSession = (session: any) => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
};

export const clearSession = () => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SESSION_KEY);
};