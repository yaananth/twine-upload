import * as core from '@actions/core';

async function run() {
  try {
    const repo = core.getInput('repo');
    core.error(`Hello ${repo}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
