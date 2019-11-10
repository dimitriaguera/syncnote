import { store } from './store';
import { startBootLocalProcess, startSynchingProcess } from '../redux/actions';

// Start and orchestr app bouting process.
export const initialize = async () => {
  try {
    await store.dispatch(startBootLocalProcess);
    await store.dispatch(startSynchingProcess);
  } catch (err) {
    console.log(err);
  }
};
