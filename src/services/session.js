const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Store token on sessionStorage.
 *
 * @param token
 */
export function setLocalToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/**
 * Store user on sessionStorage.
 *
 * @param user
 */
export function setLocalUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Return token from sessionStorage.
 *
 */
export function getLocalToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Return user from sessionStorage.
 *
 */
export function getLocalUser() {
  return JSON.parse(sessionStorage.getItem(USER_KEY));
}

/**
 * Remove token from sessionStorage.
 *
 */
export function clearLocalStorage() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
