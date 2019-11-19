import { LocalShare } from './share.class';
import { isOffline } from '../state/app.state';
import { remoteInterface } from '../sync/sync.remote';
import { prepareLocalNodeBeforeShare } from '../node/node.factory';
//import { queue } from './sync.queue';

// Socket "s.on()" events registration.
// This is data entry point from remoteDB changes.
remoteInterface.eventRegister(socket => {
  socket.eventRegister('share_change', shareChange);
  socket.eventRegister('share_ok', shareOkHandler);
  socket.eventRegister('share_errors', shareErrorsHandler);
});

// Push new data to remoteDB.
export const share = async _share => {
  try {
    const share = prepareLocalNodeBeforeShare(_share);
    remoteInterface.share(share, resp => {
      console.log('resp after share: ', resp);
      //handleRemoteResponse(resp);
    });
  } catch (err) {
    console.error(err);
  }
};

// Handle listening share ok socket room
function shareOkHandler(data) {}

// Handler listening share errors socket room.
function shareErrorsHandler(data) {
  console.log('from remote after share is ERROR: ', data);
}

async function shareChange(data) {
  // @TODO TO REMOVE !!!
  // Simulate offline mode.
  // If offline mode, abord.
  if (isOffline()) return;

  const share = new LocalShare();
  await share.handleRemoteStream(data);
}
