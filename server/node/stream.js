const mongodb = require('../db/mongodb');

const ok = '2';

module.exports = {
  _nodeStream: (pipe = []) => {
    return mongodb
      .getDb()
      .collection('node')
      .watch(pipe);
  }
};
