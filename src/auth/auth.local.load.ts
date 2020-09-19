import * as path from 'path';
import * as fs from 'fs';
import { NacosOptions } from '../api/api.facade';

const cacheConfigFile = "auth";
const cacheConfigFilePath = path.join(__filename, "..", cacheConfigFile);
let options: NacosOptions[] | undefined;

// start time will be load option to memory with auth file
if (fs.existsSync(cacheConfigFilePath)) {
    const cacheStr = fs.readFileSync(cacheConfigFilePath, { encoding: "utf-8" });
    if (cacheStr || cacheStr !== "") {
        options = JSON.parse(cacheStr);
    }
} else {
    // create file
    fs.writeFileSync(cacheConfigFilePath, "", { encoding: "utf-8" });
}

export function saveOptions(dest: NacosOptions[]) {
    dest && fs.writeFileSync(cacheConfigFilePath, JSON.stringify(dest), { encoding: "utf-8" });
    options = dest;
}

export function getOptions() {
    return options;
}