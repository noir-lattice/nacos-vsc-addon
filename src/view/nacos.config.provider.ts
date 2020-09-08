import { TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import * as vscode from "vscode";
import * as path from 'path';
import NacosApi from "../api/api.facade";
import { Namespace } from "../api/namespace.api";
import { NacosConfig, NacosConfigType } from "../api/config.api";

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
        vscode.commands.registerCommand('nacos-configurer.openConfig', resource => this.openResource(resource));
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
    constructor(public namespace: Namespace) {
        super(namespace.namespaceShowName, namespace.namespace, namespaceIcon, TreeItemCollapsibleState.Expanded);
    }
}
