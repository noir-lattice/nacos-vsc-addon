import { TreeItem, TreeItemCollapsibleState } from "vscode";
import * as vscode from "vscode";
import * as path from 'path';

import { NacosConfigType, NacosConfig } from "../../api/config.api";
import { Namespace } from "../../api/namespace.api";
import { UriUtils } from "../../utils/uri";


const namespaceIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'namespace.svg');
const textIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'text.svg');
const jsonIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'json.svg');
const xmlIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'xml.svg');
const yamlIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'yaml.svg');
const htmlIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'html.svg');
const propertiesIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'properties.svg');

export class NacosItem extends TreeItem {
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

export class NacosConfigItem extends NacosItem {
    contextValue = "NacosConfigItem";

    constructor(public nacosConfig: NacosConfig) {
        super(nacosConfig.dataId, nacosConfig.group, getIconWithType(nacosConfig.type), TreeItemCollapsibleState.None);
        this.resourceUri = UriUtils.toWritableUri(nacosConfig);
        this.command = {
            command: "nacos-configurer.openConfig",
            arguments: [this.resourceUri],
            title: "Open nacos config file"
        };
    }
}

export class NamespaceItem extends NacosItem {
    contextValue = "NamespaceItem";

    constructor(public namespace: Namespace) {
        super(namespace.namespaceShowName, namespace.namespace, namespaceIcon, TreeItemCollapsibleState.Collapsed);
    }
}
