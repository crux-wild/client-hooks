// @TODO: Wait to node.js achieve harmony module.

const ChildProcess = require('child_process');

const fs = require('fs');

class BashChildProcess extends ChildProcess {
  constructor({ scriptPath='', cwd='', isStdout=false } = {}) {
    this.[Symbol.for('isScriptExist')].then(
      function fulfill(result) {
        this = ChildProcess.spawn('bash', [scriptPath], { cwd });

        this.[Symbol.for('initOuput')](isStdout);
      },
      function reject(result) {
        let error = new ScriptDontExistError({
          scriptPath,
          reason: `The script don't exist.`,
        });
        throw error;
      }
    );
  }

  [Symbol.for('initOuput')](isStdout = false) {
    this.[Symbol.for('isStdout')] = isStdout;
    this.[Symbol.for('outputQueue')] = [];

    this.stdout.on('data', (data) => {
      if (this.[Symbol.for('isStdout')]) {
        console.log(data);
      }
      else {
        this.outputQueue.push(data);
      }
    });
  }

  *[Symbol.for('outputGenerator')]() {
    let outputQueue = this.[Symbol.for('outputQueue')];
    if (outputQueue) {
      yield outputQueue.pop();
    }
    return null;
  }

  static [Symbol.for('isScriptExist')](scriptPath='') {
    let checkResultPromise = new Promise((resolve, reject) => {
      fs.access(path, fs.F_OK, (err) => {
        if (err) {
          reject(true);
        }
        else {
          resolve(false);
        }
      });
    });
    return checkResultPromise;
  }

  IsStdout(isStdout = false) {
    return this.[Symbol.for('isStdout')];
  }

  setStdout(isStdout = false) {
    this.[Symbol.for('isStdout')]= isStdout;
  }

  getOutputIterator() {
    let outputIterator = *[Symbol.for('outputGenerator')]();
    return outputIterator;
  }

  getErrorPromise() {
    let ErrorPromise = new Promise((resolve, reject) => {
      this.stdout.on('data', (data) => {
        reject(data);
      });

      this.on('close', (code) => {
        if (code !== 0) {
          reject(`bash child process exited with code ${code}`);
        }
      });
    });
    return ErrorPromise;
  }
}

class ScriptDontExistError extends Error {
  constructor({reason = '', scriptPath = ''}) {
    super(reason);
    this.scriptPath = scriptPath;
  }
}

export BashChildProcess;