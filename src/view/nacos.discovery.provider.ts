import * as vscode from "vscode";
import { TreeDataProvider } from "vscode";
import { getServiceConfig } from "../auth/auth.options.load";

import { ConnectionItem, NacosItem, NamespaceDiscoveryItem, ServiceItem } from "./item/node.item.provider";

export class NacosDiscoveryProvider implements TreeDataProvider<NacosItem> {
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
            const opts = await getServiceConfig();
            return (opts || []).map(opt => new ConnectionItem(opt));
        } else if (element instanceof ConnectionItem) {
            const namespaces = await element.api.getAllNamespace();
            return namespaces.map(namespace => new NamespaceDiscoveryItem(namespace, element.api));
        } else if (element instanceof NamespaceDiscoveryItem) {
            const services = await element.api.getAllService(element.namespace.namespace);
            return services.map(service => new ServiceItem(service));
        }
    }

    constructor() {
        vscode.commands.registerCommand('nacos-discovery.refreshEntry', () => this.refresh());
    }
}