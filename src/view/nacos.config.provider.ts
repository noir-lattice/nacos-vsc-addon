import { TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import * as vscode from "vscode";
import * as path from 'path';
import NacosApi from "../api/api.facade";
import { Namespace } from "../api/namespace.api";
import { NacosConfig, NacosConfigType } from "../api/config.api";
import { inputOptions } from "../utils/input.box";

const namespaceIcon = path.join(__filename, '..', '..', '..', 'media', 'namespace.svg');
const textIcon = path.join(__filename, '..', '..', '..', 'media', 'text.svg');
const jsonIcon = path.join(__filename, '..', '..', '..', 'media', 'json.svg');
const xmlIcon = path.join(__filename, '..', '..', '..', 'media', 'xml.svg');
const yamlIcon = path.join(__filename, '..', '..', '..', 'media', 'yaml.svg');
const htmlIcon = path.join(__filename, '..', '..', '..', 'media', 'html.svg');
const propertiesIcon = path.join(__filename, '..', '..', '..', 'media', 'properties.svg');

export class NacosConfigProvider implements TreeDataProvider<NacosItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NacosItem | undefined> = new vscode.EventEmitter<NacosItem | undefined>();
    onDidChangeTreeData?: vscode.Event<void | NacosItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
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
            this.refresh();
        }
    }

    async removeNamespace(namespaceNode: NamespaceItem) {
        const stat = await vscode.window.showInformationMessage(`Confirm delete namespace "${namespaceNode.contextValue}"?`, "Cancel", "Allow");
        if (stat === "Allow"
            && await this.api.deleteNamespace(namespaceNode.namespace.namespace)) {
            this.refresh();
        }
    }

    getTreeItem(element: NacosItem): TreeItem | Thenable<TreeItem> {
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
        // register command
        vscode.commands.registerCommand('nacos-configurer.openConfig', resource => this.openResource(resource));
        vscode.commands.registerCommand('nacos-configurer.refreshEntry', () => this.refresh());
        vscode.commands.registerCommand('nacos-configurer.newNamespace', () => this.createNamespace());
        vscode.commands.registerCommand('nacos-configurer.deleteNamespace', (currentNamespaceNode: NamespaceItem) => this.removeNamespace(currentNamespaceNode));
    }

    private openResource(resourceUri: vscode.Uri): void {
        vscode.window.showTextDocument(resourceUri);
    }
}

class NacosItem extends TreeItem {
    constructor(
        label: string,
        desc: string,
        iconPath: string,
        collapsibleState: TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = label;
        this.description = desc;
        this.iconPath = iconPath;
    }
}

function getIconWithType(type: NacosConfigType) {
    switch (type) {
        case NacosConfigType.TEXT:
            return textIcon;
        case NacosConfigType.JSON:
            return jsonIcon;
        case NacosConfigType.XML:
            return xmlIcon;
        case NacosConfigType.YAML:
            return yamlIcon;
        case NacosConfigType.HTML:
            return htmlIcon;
        case NacosConfigType.PROPERTIES:
            return propertiesIcon;
        default:
            return textIcon;
    }
}

class NacosConfigItem extends NacosItem {
    constructor(public nacosConfig: NacosConfig) {
        super(nacosConfig.dataId, nacosConfig.group, getIconWithType(nacosConfig.type), TreeItemCollapsibleState.None);
        this.resourceUri = vscode.Uri.parse(`nacos-configurer:/${nacosConfig.tenant || "default"}/${nacosConfig.group}/${nacosConfig.dataId}`);
        this.command = {
            command: "nacos-configurer.openConfig",
            arguments: [this.resourceUri],
            title: "Open nacos config file"
        };
    }
}

class NamespaceItem extends NacosItem {
    contextValue = "NamespaceItem";

    constructor(public namespace: Namespace) {
        super(namespace.namespaceShowName, namespace.namespace, namespaceIcon, TreeItemCollapsibleState.Collapsed);
    }
}


function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}