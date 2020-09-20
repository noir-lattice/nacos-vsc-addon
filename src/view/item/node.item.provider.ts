import { TreeItem, TreeItemCollapsibleState } from "vscode";
import * as path from 'path';

import { NacosConfigType, NacosConfig } from "../../api/config.api";
import { Namespace } from "../../api/namespace.api";
import { UriUtils } from "../../utils/uri";
import NacosApi, { NacosOptions } from "../../api/api.facade";
import { NacosService } from "../../api/services.api";

const connectionIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'connection.svg');
const namespaceIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'namespace.svg');
const serviceIcon = path.join(__filename, '..', '..', '..', '..', 'media', 'service.svg');
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

    constructor(public nacosConfig: NacosConfig, public api: NacosApi) {
        super(nacosConfig.dataId, nacosConfig.group, getIconWithType(nacosConfig.type), TreeItemCollapsibleState.None);
        this.resourceUri = UriUtils.toWritableUri(nacosConfig, api.instanceCounter);
        this.command = {
            command: "nacos-configurer.openConfig",
            arguments: [this.resourceUri],
            title: "Open nacos config file"
        };
    }
}

export class NamespaceConfigItem extends NacosItem {
    contextValue = "NamespaceConfigItem";

    constructor(public namespace: Namespace, public api: NacosApi) {
        super(namespace.namespaceShowName, namespace.namespace, namespaceIcon, TreeItemCollapsibleState.Collapsed);
    }
}

export class ServiceItem extends NacosItem {
    contextValue = "ServiceItem";

    constructor(public service: NacosService, public api: NacosApi) {
        super(service.name, service.groupName, serviceIcon, TreeItemCollapsibleState.None);
    }
}

export class NamespaceDiscoveryItem extends NacosItem {
    contextValue = "NamespaceDiscoveryItem";

    constructor(public namespace: Namespace, public api: NacosApi) {
        super(namespace.namespaceShowName, namespace.namespace, namespaceIcon, TreeItemCollapsibleState.Collapsed);
    }
}

export class ConnectionItem extends NacosItem {
    contextValue = "ConnectionItem";
    api: NacosApi;

    constructor(public options: NacosOptions) {
        super(options.url, '', connectionIcon, TreeItemCollapsibleState.Expanded);
        this.api = NacosApi.createInstanceByOptions(options);
    }
}
