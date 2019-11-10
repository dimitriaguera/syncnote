const { getNodeById, getNodeByUserId } = require('../node/controller');

module.exports = {};

class AddSync {
  constructor(data) {
    this.local = data;
    this.remote = null;
    this.status = 0;
  }

  async pipe() {
    try {
    } catch (err) {}
  }

  async exist() {
    if (!this.remote) {
      this.remote = await getNodeById(this.local._id);
    }
    return !!this.remote;
  }

  async compare() {
    if (!this.remote) {
      this.remote = await getNodeById(this.local._id);
    }
    return this.remote._rev === this.local._rev;
  }

  async action() {}

  async abord() {}
}

class UpdateSync {}

class DeleteSync {}
