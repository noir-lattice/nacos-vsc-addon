import NacosApi from "../api/api.facade";
import * as vscode from "vscode";

import { NacosConfigProvider } from "../view/nacos.config.provider";
import { inputOptions } from "../utils/input.box";
import { NamespaceItem, NacosConfigItem } from "../view/item/node.item.provider";
import { UriUtils } from "../utils/uri";

let currentFile: vscode.Uri | undefined;
let currentDataId: string | undefined;

export class ConfigService {

    constructor(
        private nacosConfigProvider: NacosConfigProvider,
        private api: NacosApi,
    ) {
        vscode.commands.registerCommand('nacos-configurer.createConfig', (namespaceNode: NamespaceItem) => this.createConfig(namespaceNode));
        vscode.commands.registerCommand('nacos-configurer.deleteConfig', (configNode: NacosConfigItem) => this.removeConfig(configNode));
        vscode.commands.registerCommand('nacos-configurer.diffConfig', (configNode: NacosConfigItem) => this.diffConfig(configNode));
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
            const fileUri = UriUtils.toWritableUri({
                tenant: namespaceNode.namespace.namespace,
                group: createConfigOpt.group,
                dataId: createConfigOpt.dataId,
            })
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

    async diffConfig(configNode: NacosConfigItem) {
        if (!currentFile) {
            currentFile = UriUtils.toReadonlyUri(configNode.nacosConfig);
            currentDataId = configNode.nacosConfig.dataId;
        } else {
            vscode.commands.executeCommand("vscode.diff",
                UriUtils.toWritableUri(configNode.nacosConfig),
                currentFile,
                `${configNode.nacosConfig.dataId} ⇋ ${currentDataId}`);
            currentFile = undefined;
            currentDataId = undefined;
        }
    }
}