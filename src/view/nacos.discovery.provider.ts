import * as vscode from "vscode";
import { TreeDataProvider } from "vscode";
import { NacosCreateServiceOptions } from "../api/services.api";
import { getServiceConfig } from "../auth/auth.options.load";
import { inputOptions } from "../utils/input.box";

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
            return services.map(service => new ServiceItem(service, element.api));
        }
    }

    constructor() {
        vscode.commands.registerCommand('nacos-discovery.refreshEntry', () => this.refresh());
        vscode.commands.registerCommand('nacos-discovery.removeService', (service: ServiceItem) => this.removeService(service));
        vscode.commands.registerCommand('nacos-discovery.createService', (namespaceItem: NamespaceDiscoveryItem) => this.createService(namespaceItem));
    }

    private async removeService(service: ServiceItem) {
        const stat = await vscode.window.showInformationMessage(`Confirm delete service "${service.contextValue}"?`, "Cancel", "Allow");
        if (stat === "Allow"
            && await service.api.deleteService(service.service)) {
            this.refresh();
        }
    }

    private async createService(namespaceItem: NamespaceDiscoveryItem) {
        const opt: NacosCreateServiceOptions = await inputOptions([{
            param: "serviceName",
            defaultVal: "",
            placeHolder: "Service name"
        }, {
            param: "protectThreshold",
            defaultVal: "1",
            placeHolder: "Protect threshold"
        }, {
            param: "groupName",
            defaultVal: "DEFAULT_GROUP",
            placeHolder: "Group name"
        }, {
            param: "metadata",
            defaultVal: "",
            placeHolder: "Metadata",
            nullable: true
        }]);
        if (opt) {
            opt.namespaceId = namespaceItem.namespace.namespace;
            opt.protectThreshold = parseInt(opt.protectThreshold as any);
            if (await namespaceItem.api.createService(opt)) {
                this.refresh();
            }
        }
    }
}