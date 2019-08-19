import * as core from '@actions/core';
import * as exec from'@actions/exec';
import * as fs from "fs";
import * as path from "path";


const PypircName = "twineghubaction.pypirc";
const getPypircPath = (root: string) => path.join(root, PypircName);

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
    const runnerContext: IRunnerContext = JSON.parse(process.env.RUNNER_CONTEXT || "");
    // Install dependencies
    await exec.exec('python -m pip install --upgrade pip twine');
    await exec.exec('pip install -r requirements.txt');

    // Package
    await exec.exec(`python setup.py sdist --dist-dir ${runnerContext.temp}`);  

    // Create necessary config for twine
    writePypirc(runnerContext);

    // Upload
    const configPath = getPypircPath(runnerContext.workspace);
    await exec.exec(`twine upload -r nimport --config-file "${configPath}" ${runnerContext.temp}/* --skip-existing`);  
  } catch (error) {
    core.setFailed(error.message);
  }
}

function writePypirc(runnerContext: IRunnerContext) {
  const secretsContext: ISecretsContext = JSON.parse(process.env.SECRETS_CONTEXT || "");
  const pypricContents = `
  [distutils]
    index-servers=
      ${core.getInput('repo')}
  [pypi]
      username: ${secretsContext.username}
      password: ${secretsContext.password}
  `;
  try {
    fs.writeFileSync(getPypircPath(runnerContext.workspace), pypricContents);
  }
  catch(error) {
    core.setFailed(error.message);
  }
}

run();
