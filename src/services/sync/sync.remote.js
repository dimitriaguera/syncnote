
import socket from "../socket";
import { getLocalNodeById } from "../local-db";

class Queue {
  constructor() {
    this.running = {};
    this.pool = {};
    this.lastRev = {};
  }

  async add( data, callback ) {
    // get node id
    const _id = data._id;

    // if no waiting for remove node push ok
    // we can push immediatly
    if ( !this.running[_id] ) {
      this.running[_id] = true;
      if( this.lastRev[_id] ) {
        data._rev = this.lastRev[_id];
      }
      console.log('+++++ add: push to remote from addQueue: ', data);
      socket.emit( 'push', data, callback );
    }

    // if node is running on remote
    // store next action
    else {
      console.log('+++++ add: add pool queue', data);
      this.pool[_id] = {
        data,
        callback
      }
    }
  }

  storeRev(_id, _rev) {
    this.lastRev[_id] = _rev;
  }

  next( _id, _rev = null ) {

    // if push waiting on pool for this node
    if( this.pool[_id] ) {
      // get datas
      const { data, callback } = this.pool[_id];

      // clear pool
      this.pool[_id] = null;

      // add last _rev
      if( _rev ) {
        data._rev = _rev;
      }

      // emit a push to remote
      console.log('+++++ next: push to remote from nextQueue: ', data);
      socket.emit( 'push', data, callback );
      return true;
    } 

    // flag node is not yet running
    console.log('+++++ next: close queue', _id, _rev);
    this.running[_id] = false;
    return false;
  }
}

class RemoteInterface {
  constructor() {
    this.queue = new Queue();
  }

  eventRegister( registration ) {
    if( typeof registration === 'function' ) {
      registration.call( null, socket );
    }
  }

  sync( data, callback ) {
    socket.emit( 'sync', data, callback );
  }

  push( data, callback ) {
    this.queue.add( data, callback );
  }

  nextPush( _id, _rev ) {
    this.queue.next( _id, _rev );
  }

  storeRev( _id, _rev ) {
    this.queue.storeRev( _id, _rev );
  }
}

export let remoteInterface = new RemoteInterface();