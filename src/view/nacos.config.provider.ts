import { TreeDataProvider } from "vscode";
import * as vscode from "vscode";
import { NacosItem, NamespaceConfigItem, NacosConfigItem, ConnectionItem } from "./item/node.item.provider";
import { NamespaceService } from "../services/namespace.service";
import { ConfigService } from "../services/config.service";
import { registerHistory } from "./nacos.config.history";
import { getServiceConfig, openConfigInput, removeOptions, saveServiceConfig } from "../auth/auth.options.load";

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
            const opts = await getServiceConfig();
            return (opts || []).map(opt => new ConnectionItem(opt));
        } else if (element instanceof ConnectionItem) {
            const namespaces = await element.api.getAllNamespace();
            return namespaces.map(namespace => new NamespaceConfigItem(namespace, element.api));
        } else if (element instanceof NamespaceConfigItem) {
            const configs = await element.api.getAllConfig({
                tenant: element.namespace.namespace,
                pageNo: 1,
                pageSize: element.namespace.configCount || 10,
            });
            return configs.map(config => new NacosConfigItem(config, element.api));
        }
    }

    constructor(context: vscode.ExtensionContext) {
        // register namespace service
        NamespaceService.register(this);
        // register config service
        ConfigService.register(this);
        // register history
        registerHistory(context);
        // register command
        vscode.commands.registerCommand('nacos.createConnection', () => this.updateConnection());
        vscode.commands.registerCommand('nacos.removeConnection', (connectionItem: ConnectionItem) => this.removeConnection(connectionItem));
        vscode.commands.registerCommand('nacos.updateConnection', (connectionItem: ConnectionItem) => this.updateConnection(connectionItem));
        vscode.commands.registerCommand('nacos-configurer.openConfig', resource => this.openResource(resource));
        vscode.commands.registerCommand('nacos-configurer.refreshEntry', () => this.refresh());
    }

    private openResource(resourceUri: vscode.Uri): void {
        vscode.window.showTextDocument(resourceUri);
    }

    private async updateConnection(connectionItem?: ConnectionItem) {
        const options = await openConfigInput(connectionItem ? connectionItem.options : undefined);
        options && await saveServiceConfig(options);
        this.refresh();
    }

    private async removeConnection(connectionItem: ConnectionItem) {
        const stat = await vscode.window.showInformationMessage(`Confirm delete connection "${connectionItem.contextValue}"?`, "Cancel", "Allow");
        if (stat === "Allow") {
            await removeOptions(connectionItem.options);
            this.refresh();
        }
    }

}
