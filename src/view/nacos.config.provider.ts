import { TreeDataProvider } from "vscode";
import * as vscode from "vscode";
import NacosApi from "../api/api.facade";
import { NacosItem, NamespaceItem, NacosConfigItem } from "./item/node.item.provider";

export class NacosConfigProvider implements TreeDataProvider<NacosItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NacosItem | undefined> = new vscode.EventEmitter<NacosItem | undefined>();
    onDidChangeTreeData?: vscode.Event<void | NacosItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: NacosItem) {
        return element;
    }

    async getChildren(element?: NacosItem | undefined) {
        if (!element) {
            const namespaces = await this.api.getAllNamespace();
            return namespaces.map(namespace => new NamespaceItem(namespace));
        } else if (element instanceof NamespaceItem) {
            const configs = await this.api.getAllConfig({
                tenant: element.namespace.namespace,
                pageNo: 1,
                pageSize: element.namespace.configCount || 10,
            });
            return configs.map(config => new NacosConfigItem(config));
        }
    }

    constructor(private api: NacosApi) {
        vscode.commands.registerCommand('nacos-configurer.openConfig', resource => this.openResource(resource));
    }

    private openResource(resourceUri: vscode.Uri): void {
		vscode.window.showTextDocument(resourceUri);
	}
}
