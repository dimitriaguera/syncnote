class Queue {
  constructor() {
    this.running = false;
    this.pool = [];
    this.onRun = null;
  }

  add(record) {
    this.pool.unshift(record);
    this.run();
  }

  pop() {
    return this.pool.pop();
  }

  setOnRun(callback) {
    if (typeof callback === 'function') {
      this.onRun = callback;
    } else {
      console.error(`Run queue setOnRun error. ${callback} is not a function.`);
    }
  }

  async run() {
    // if no run func set, abord
    if (!this.onRun) {
      console.warn('Run queue abord. No run func set.');
      return null;
    }

    // if already running, let it be
    if (this.running) {
      return null;
    }

    // flag start running
    this.running = true;

    // start loop
    while (this.pool.length) {
      // get oldest record
      let data = this.pop();

      // execute async action
      await this.onRun(data);
    }

    // stop running when no more records
    this.running = false;
  }
}

export let queue = new Queue();
