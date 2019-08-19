"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// These are added run actions using "env:"
let runner = JSON.parse(process.env.RUNNER || "");
let secrets = JSON.parse(process.env.SECRETS || "");
const PypircName = "twineghubaction.pypirc";
const PypircPath = path.join(runner.workspace, PypircName);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Install dependencies
            yield exec.exec('sudo python -m pip install pip twine');
            yield exec.exec('sudo python -m pip install -r requirements.txt');
            // Package
            yield exec.exec(`sudo python setup.py sdist --dist-dir ${runner.temp}`);
            // Create necessary config for twine
            writePypirc();
            // Upload
            yield exec.exec(`twine upload --config-file "${PypircPath}" ${runner.temp}/* --skip-existing`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function writePypirc() {
    const pypricContents = `
[distutils]
index-servers=pypi
[pypi]
username=${secrets.username}
password=${secrets.password}
`;
    try {
        fs.writeFileSync(PypircPath, pypricContents);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
