const adminKey = "digital-life-log:is-admin";

export function isAdminSession() {
  return window.localStorage.getItem(adminKey) === "true";
}

export function setAdminSession(value: boolean) {
  window.localStorage.setItem(adminKey, String(value));
}

export function clearAdminSession() {
  window.localStorage.removeItem(adminKey);
}
