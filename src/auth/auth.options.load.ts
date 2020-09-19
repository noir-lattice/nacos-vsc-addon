
import * as vscode from "vscode";

import * as configFile from "./auth.local.load";

import { AuthOptions, NacosOptions } from '../api/api.facade';
import { inputOptions } from '../utils/input.box';

export async function openConfigInput(opt?: NacosOptions) {
    opt = (opt || {}) as AuthOptions;
    const options = await inputOptions([
        {
            placeHolder: "url",
            defaultVal: opt.url || "http://localhost:8848/nacos",
            param: "url"
        },
        {
            placeHolder: "username",
            defaultVal: "nacos",
            param: opt.username || "username"
        },
        {
            placeHolder: "password",
            defaultVal: "",
            param: opt.password || "password",
            password: true
        }
    ],
        "The Nacos addon support cannot be obtained without basic authentication information");
    if (options) { 
        configFile.saveOptions(options);
        vscode.commands.executeCommand('setContext', 'noServiceInfomation', false);
    }
    return options;
}

export async function getServiceConfig(): Promise<NacosOptions | undefined> {
    const opt = configFile.getOptions();
    if (!opt) {
        vscode.commands.executeCommand('setContext', 'noServiceInfomation', true);
    }
    return opt;
}
