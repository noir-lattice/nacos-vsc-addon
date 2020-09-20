import * as vscode from "vscode";

import { inputOptions } from "../utils/input.box";
import { ConnectionItem, NamespaceConfigItem } from "../view/item/node.item.provider";
import { NacosConfigProvider } from "../view/nacos.config.provider";


export class NamespaceService {

    static register(nacosConfigProvider: NacosConfigProvider) {
        new NamespaceService(nacosConfigProvider);
    }

    private constructor(
        private nacosConfigProvider: NacosConfigProvider,
    ) {
        vscode.commands.registerCommand('nacos-configurer.newNamespace', (currentConnectionNode: ConnectionItem) => this.createNamespace(currentConnectionNode));
        vscode.commands.registerCommand('nacos-configurer.deleteNamespace', (currentNamespaceNode: NamespaceConfigItem) => this.removeNamespace(currentNamespaceNode));
        vscode.commands.registerCommand('nacos-configurer.updateNamespace', (currentNamespaceNode: NamespaceConfigItem) => this.updateNamespace(currentNamespaceNode));
    }

    async createNamespace(currentConnectionNode: ConnectionItem) {
        const namespaceCreateOpt = await inputOptions([
            {
                placeHolder: "namespace",
                param: "namespaceName",
                defaultVal: ""
            }, {
                placeHolder: "describe",
                param: "namespaceDesc",
                defaultVal: ""
            }, {
                placeHolder: "namespace id",
                param: "customNamespaceId",
                defaultVal: guid()
            }
        ]);
        if (namespaceCreateOpt
            && await currentConnectionNode.api.createNamespace(namespaceCreateOpt)) {
            this.nacosConfigProvider.refresh();
        }
    }

    async removeNamespace(namespaceNode: NamespaceConfigItem) {
        const stat = await vscode.window.showInformationMessage(`Confirm delete namespace "${namespaceNode.contextValue}"?`, "Cancel", "Allow");
        if (stat === "Allow"
            && await namespaceNode.api.deleteNamespace(namespaceNode.namespace.namespace)) {
            this.nacosConfigProvider.refresh();
        }
    }

    async updateNamespace(namespaceNode: NamespaceConfigItem) {
        const namespace = await namespaceNode.api.getNamespace(namespaceNode.namespace.namespace);
        const namespaceUpdateOpt = await inputOptions([{
            placeHolder: "show name",
            param: "namespaceShowName",
            defaultVal: namespace.namespaceShowName
        },
        {
            placeHolder: "describe",
            param: "namespaceDesc",
            defaultVal: namespace.namespaceDesc
        }]);
        if (namespaceUpdateOpt) {
            namespaceUpdateOpt.namespace = namespace.namespace;
            if (await namespaceNode.api.updateNamespace(namespaceUpdateOpt)) {
                this.nacosConfigProvider.refresh();
            }
        }
    }
}

function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}