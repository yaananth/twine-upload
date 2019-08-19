import * as core from '@actions/core';
import * as exec from'@actions/exec';
import * as fs from "fs";
import * as path from "path";

// These are added run actions using "env:"
let runner: IRunnerContext = JSON.parse(process.env.RUNNER || "");
let secrets: ISecretsContext = JSON.parse(process.env.SECRETS || "");

const PypircName = "twineghubaction.pypirc";
const PypircPath =path.join(runner.workspace, PypircName);

interface IRunnerContext {
  os: string;
  tool_cache: string;
  temp: string;
  workspace: string;
}

interface ISecretsContext {
  username: string;
  password: string;
}

async function run() {
  try {
    // Install dependencies
    await exec.exec('python -m pip install --upgrade pip twine');
    await exec.exec('pip install -r requirements.txt');

    // Package
    await exec.exec(`python setup.py sdist --dist-dir ${runner.temp}`);  

    // Create necessary config for twine
    writePypirc();

    // Upload
    await exec.exec(`twine upload -r nimport --config-file "${PypircPath}" ${runner.temp}/* --skip-existing`);  
  } catch (error) {
    core.setFailed(error.message);
  }
}

function writePypirc() {
  const pypricContents = `
  [distutils]
    index-servers=
      ${core.getInput('repo')}
  [pypi]
      username: ${secrets.username}
      password: ${secrets.password}
  `;
  try {
    fs.writeFileSync(PypircPath, pypricContents);
  }
  catch(error) {
    core.setFailed(error.message);
  }
}

run();
