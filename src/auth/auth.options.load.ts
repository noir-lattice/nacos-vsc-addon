
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
    ]);
    return options;
}

export async function saveServiceConfig(target: NacosOptions) {
    let options = await getServiceConfig();
    options = options || [];
    for (let index = 0; index < options.length; index++) {
        const option = options[index];
        if (target.url === option.url) {
            options.splice(index, 1); // remove old config
            index--;
        }
    }
    options.push(target);
    vscode.commands.executeCommand('setContext', 'noServiceInfomation', false);
    configFile.saveOptions(options);
}

export async function removeOptions(current: NacosOptions) {
    let options = await getServiceConfig();
    options = options || [];
    for (let index = 0; index < options.length; index++) {
        const option = options[index];
        if (current === option) {
            options.splice(index, 1);
            if (!options.length) {
                vscode.commands.executeCommand('setContext', 'noServiceInfomation', true);
            }
            configFile.saveOptions(options);
            return;
        }
    }
}

export async function getServiceConfig(): Promise<(NacosOptions[] | undefined)> {
    const opt = configFile.getOptions();
    if (!opt) {
        vscode.commands.executeCommand('setContext', 'noServiceInfomation', true);
    }
    return opt;
}
