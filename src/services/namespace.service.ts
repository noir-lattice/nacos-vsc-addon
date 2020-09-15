import * as vscode from "vscode";

import NacosApi from "../api/api.facade";
import { inputOptions } from "../utils/input.box";
import { NacosConfigProvider, NamespaceItem } from "../view/nacos.config.provider";


export class NamespaceService {

    constructor(
        private nacosConfigProvider: NacosConfigProvider,
        private api: NacosApi,
    ) {
        vscode.commands.registerCommand('nacos-configurer.newNamespace', () => this.createNamespace());
        vscode.commands.registerCommand('nacos-configurer.deleteNamespace', (currentNamespaceNode: NamespaceItem) => this.removeNamespace(currentNamespaceNode));
        vscode.commands.registerCommand('nacos-configurer.updateNamespace', (currentNamespaceNode: NamespaceItem) => this.updateNamespace(currentNamespaceNode));
    }

    async createNamespace() {
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
        ], "Cancel create namespace");
        if (namespaceCreateOpt
            && await this.api.createNamespace(namespaceCreateOpt)) {
            this.nacosConfigProvider.refresh();
        }
    }

    async removeNamespace(namespaceNode: NamespaceItem) {
        const stat = await vscode.window.showInformationMessage(`Confirm delete namespace "${namespaceNode.contextValue}"?`, "Cancel", "Allow");
        if (stat === "Allow"
            && await this.api.deleteNamespace(namespaceNode.namespace.namespace)) {
            this.nacosConfigProvider.refresh();
        }
    }

    async updateNamespace(namespaceNode: NamespaceItem) {
        const namespace = await this.api.getNamespace(namespaceNode.namespace.namespace);
        const namespaceUpdateOpt = await inputOptions([{
            placeHolder: "show name",
            param: "namespaceShowName",
            defaultVal: namespace.namespaceShowName
        },
        {
            placeHolder: "describe",
            param: "namespaceDesc",
            defaultVal: namespace.namespaceDesc
        }],
            "Cancel update namespace");
        if (namespaceUpdateOpt) {
            namespaceUpdateOpt.namespace = namespace.namespace;
            if (await this.api.updateNamespace(namespaceUpdateOpt)) {
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