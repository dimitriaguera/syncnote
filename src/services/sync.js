import { createDb, updateDb } from "./db";
import { get } from "./fetch";
import { store } from "./reduxServ";
import { startBootLocalProcess } from "../redux/actions";
import socket from "../services/socket";

socket.eventRegister("pull", pullHandler);

export const initialize = () => {
  store.dispatch(startBootLocalProcess);
};

export const createDbFromRemote = async user => {
  const { data } = await get(`/node/${user._id}`);
  const result = await createDb(data);
  return result;
};

export const push = async data => {
  // Update local indexDB.
  updateDb(data);
  socket.emit("push", data, resp => {
    console.log("resp after push: ", resp);
    //@Todo : handle response to manage conflicts.
  });
};

export const push_bulk = async data => {
  const bulk = {
    update: [data]
  };
  socket.emit("push_bulk", bulk, resp => {
    console.log("resp after push: ", resp);
  });
};

export async function pullHandler(data) {
  console.log("from pull: ", data);
  updateDb(data);
}
