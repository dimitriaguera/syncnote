import { get } from '../fetch';

export const getRemoteNode = async _id => {
  const data = await get(`/node/${_id}`);
  return data.data;
};
