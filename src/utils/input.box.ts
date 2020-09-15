import * as vscode from "vscode";

export interface TargetOptions {
    [key: string]: string;
}

export interface InputOptionMeta {
    param: string;
    defaultVal: string;
    placeHolder?: string;
    password?: boolean;
}

export async function inputOptions(fields: InputOptionMeta[], cancelMsg: string) {
    const target = {} as any;
    for (const field of fields) {
        const result = await vscode.window.showInputBox({
            placeHolder: field.placeHolder,
            value: field.defaultVal,
            password: field.password
        });
        if (!result) {
            vscode.window.showErrorMessage(cancelMsg);
            return undefined;
        }
        target[field.param] = result;
    }
    return target;
}