const STORAGE = localStorage;
const TOKEN_KEY = "_NEkOT";
const USER_KEY = "_REsU";

/**
 * Store token on sessionStorage.
 *
 * @param token
 */
export function setLocalToken(token) {
  STORAGE.setItem(TOKEN_KEY, token);
}

/**
 * Store user on sessionStorage.
 *
 * @param user
 */
export function setLocalUser(user) {
  STORAGE.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Return token from sessionStorage.
 *
 */
export function getLocalToken() {
  return STORAGE.getItem(TOKEN_KEY);
}

/**
 * Return user from sessionStorage.
 *
 */
export function getLocalUser() {
  return JSON.parse(STORAGE.getItem(USER_KEY));
}

/**
 * Remove token from sessionStorage.
 *
 */
export function clearLocalStorage() {
  STORAGE.removeItem(TOKEN_KEY);
  STORAGE.removeItem(USER_KEY);
}

export function registerStorageEvent(handler) {
  window.addEventListener("storage", function(e) {
    handler(e);
  });
}

export function onUserChange(callNoUser, callNewUser) {
  registerStorageEvent(e => {
    if (e.key !== USER_KEY) return false;
    try {
      if (e.oldValue !== e.newValue) {
        console.log(e.oldValue);
        console.log(e.newValue);
        if (!e.newValue) {
          callNoUser();
        } else {
          const user = JSON.parse(e.newValue);
          callNewUser(user);
        }
      }
    } catch (e) {
      console.log("Error on login switch.", e);
    }
  });
}
