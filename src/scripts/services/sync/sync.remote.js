
import socket from "../socket";
import { updateNodeToLocalDb } from "../db/db.local";
import { prepareNodeToRemoteSync } from '../node/node.factory';

class RemoteQueue {
  constructor() {
    this.running = {};
    this.pool = {};
    this.lastRev = {};
  }

  add( node, callback ) {
    // get node id
    const { _id } = node;

    // if no waiting for remove node push ok
    // we can push immediatly
    if ( !this.running[_id] ) {

      // flag running immadiatly
      this.running[_id] = true;

      // send to remote
      this.send( _id, node, callback );
    }

    // if node is already running on remote
    // store next action
    else {
      this.pool[_id] = {
        node,
        callback
      }
    }
  }

  next( _id ) {
    // if push waiting on pool for this node
    if( this.pool[_id] ) {
      // get datas
      const { node, callback } = this.pool[_id];

      // clear pool
      this.pool[_id] = null;

      // init var
      this.send( _id, node, callback );
      return true;
    } 

    // flag node is not yet running
    this.running[_id] = false;
    return false;
  }

  refresh(_id, _rev) {
    // if no rev stored, create _id key
    if( !this.lastRev[_id] ) {
      this.lastRev[_id] = {};
    }
    // store new _rev
    this.lastRev[_id]._rev = _rev;
  }

  async send( _id, node, callback ) {
    // declare versionning vars
    let _rev = null;

    // get values if stored
    if( this.lastRev[_id] ) {
      if( this.lastRev[_id]._rev ) {
        _rev = this.lastRev[_id]._rev;
      }
    }

    // prepare node to be send for sync to remote server
    const nodeToRemote = prepareNodeToRemoteSync( node, _rev );

    // update _sync_pool value on local db
    await updateNodeToLocalDb(_id, { _sync_pool: [node._tId].concat(node._sync_pool || []) });

    // send on push room socket channel
    socket.emit( 'push', nodeToRemote, callback );
  }
}

class RemoteInterface {
  constructor() {
    this.queue = new RemoteQueue();
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

  nextPush( _id ) {
    this.queue.next( _id );
  }

  refresh( _id, _rev ) {
    this.queue.refresh( _id, _rev );
  }
}

export let remoteInterface = new RemoteInterface();