import NacosApi from "../api/api.facade";
import * as vscode from "vscode";

import { NacosConfigItem, NacosConfigProvider, NamespaceItem } from "../view/nacos.config.provider";
import { inputOptions } from "../utils/input.box";

export class ConfigService {

    constructor(
        private nacosConfigProvider: NacosConfigProvider,
        private api: NacosApi,
    ) {
        vscode.commands.registerCommand('nacos-configurer.createConfig', (namespaceNode: NamespaceItem) => this.createConfig(namespaceNode));
        vscode.commands.registerCommand('nacos-configurer.deleteConfig', (configNode: NacosConfigItem) => this.removeConfig(configNode));
    }

    async createConfig(namespaceNode: NamespaceItem) {
        const createConfigOpt = await inputOptions([{
            param: "dataId",
            defaultVal: "",
            placeHolder: "Data id"
        }, {
            param: "group",
            defaultVal: "DEFAULT_GROUP",
            placeHolder: "Group"
        }], "Cancel create config");
        if (createConfigOpt) {
            const fileUri = vscode.Uri.parse(`nacos-configurer:/${namespaceNode.namespace.namespace}/${createConfigOpt.group}/${createConfigOpt.dataId}`);
            vscode.workspace.openTextDocument(fileUri).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(fileUri, new vscode.Position(0, 0), "You must be save something to create origin config file!");
                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {
                        vscode.window.showTextDocument(document);
                    } else {
                        vscode.window.showInformationMessage('Error!');
                    }
                });
            });
        }
    }

    async removeConfig(configNode: NacosConfigItem) {
        const stat = await vscode.window.showInformationMessage(`Confirm delete config "${configNode.nacosConfig.dataId}"?`, "Cancel", "Allow");
        if (stat === "Allow"
            && await this.api.deleteConfig(configNode.nacosConfig)) {
            this.nacosConfigProvider.refresh();
        }
    }
}