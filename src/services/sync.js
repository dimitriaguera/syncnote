import { createDb } from "./db";
import { get } from "./fetch";

export const createDbFromRemote = async user => {
  const { data } = await get(`/node/${user._id}`);
  const result = await createDb(data);
  return result;
};
