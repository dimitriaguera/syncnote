import { post } from "./fetch";

export const loginFetch = async (username, password) => {
  try {
    const response = await post("/auth/login", {
      username: username,
      password: password
    });
    return {
      token: response.data.data.token,
      user: response.data.data.user
    };
  } catch (err) {
    throw err;
  }
};
