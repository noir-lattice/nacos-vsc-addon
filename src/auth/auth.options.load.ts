import * as path from 'path';
import * as fs from 'fs';
import * as vscode from "vscode";
import NacosApi, { NacosOptions, TokenOptions, AuthOptions } from '../api/api.facade';

const cacheConfigFile = "auth";
const cacheConfigFilePath = path.join(__filename, "..", cacheConfigFile);
let options: NacosOptions | undefined;

if (fs.existsSync(cacheConfigFilePath)) {
    const cacheStr = fs.readFileSync(cacheConfigFilePath, { encoding: "utf-8" });
    if (cacheStr || cacheStr !== "") {
        options = JSON.parse(cacheStr);
    }
} else {
    fs.writeFileSync(cacheConfigFilePath, "", { encoding: "utf-8" });
}

function saveOptions() {
    options && fs.writeFileSync(cacheConfigFilePath, JSON.stringify(options), { encoding: "utf-8" });
}

async function loadConfigWithUser() {
    const url = await vscode.window.showInputBox({
        value: "http://localhost:8848/nacos"
    });
    if (!url) {
        vscode.window.showErrorMessage("The Nacos addon support cannot be obtained without basic authentication information!");
        return;
    }
    const username = await vscode.window.showInputBox({
        value: "nacos"
    });
    if (!username) {
        vscode.window.showErrorMessage("The Nacos addon support cannot be obtained without basic authentication information!");
        return;
    }
    const password = await vscode.window.showInputBox({
        password: true
    });
    if (!password) {
        vscode.window.showErrorMessage("The Nacos addon support cannot be obtained without basic authentication information!");
        return;
    }
    options = {
        url,
        username,
        password
    };
}

export async function createApiHandleWithNacosConfig(): Promise<NacosApi> {
    if (!options) {
        // Can't load old config with nacos
        // we should get basic authentication 
        // info with user. 
        await loadConfigWithUser();
    }
    if (!options) {
        throw new Error("Can't load basic info with nacos!");
    }

    const api = new NacosApi(options);
    if (!(options as TokenOptions).accessToken) {
        try {
            await signInAndSaveOptions(api);
        } catch {
            return createApiHandleWithNacosConfig();
        }
    }

    // token expire
    api.errCallback.push(async res => {
        if (res.status === 403) {
            try {
                await signInAndSaveOptions(api);
            } catch {
                createApiHandleWithNacosConfig();
            }
        }
    });
    
    return api;
}

async function signInAndSaveOptions(api: NacosApi) {
    let signInRes;
    try {
        signInRes = await api.signIn(options as AuthOptions);
    } catch  {
        // pass
    }
    if (!signInRes || !signInRes.accessToken) {
        vscode.window.showErrorMessage("The Nacos addon support cannot be obtained without basic authentication information!");
        options = undefined;
        throw new Error("Can't sign in.");
    }
    (options as TokenOptions).accessToken = signInRes.accessToken;
    saveOptions();
}
