import * as vscode from "vscode";
import NacosApi from "../api/api.facade";
import { NacosConfig, NacosConfigType } from "../api/config.api";
import { NaconfigFileSystemType } from "../constants/constants";
import { string10to62, string62to10 } from "./number";

export class UriUtils {

    static toWritableUri(nacosConfig: Partial<NacosConfig>, apiIndex: number) {
        return vscode.Uri.parse(`${NaconfigFileSystemType.WRITABLE}:/${apiIndex}/${nacosConfig.tenant || 'default'}/${nacosConfig.group}/${nacosConfig.dataId}`);
    }

    static toReadonlyUri(nacosConfig: NacosConfig, apiIndex: number) {
        return vscode.Uri.parse(`${NaconfigFileSystemType.READONLY}:/${apiIndex}/${nacosConfig.tenant || 'default'}/${nacosConfig.group}/${nacosConfig.dataId}`);
    }

    static toHistoryUri(nacosConfig: NacosConfig, id: number, apiIndex: number) {
        return vscode.Uri.parse(`${NaconfigFileSystemType.HISTORY}:/${apiIndex}/${string10to62(id)}/${nacosConfig.tenant || 'default'}/${nacosConfig.group}/${nacosConfig.dataId}`);
    }

    static toNacosConfig(uri: vscode.Uri): Partial<NacosConfig> {
        const type: NaconfigFileSystemType = uri.scheme as NaconfigFileSystemType;
        const paths = uri.path.split('/');
        paths.shift()!; // skip empty string
        paths.shift()!; // skip apiIndex
        let tenant: string, group: string, dataId: string, id: number | undefined = undefined;
        if (type === NaconfigFileSystemType.HISTORY) {
            id = string62to10(paths.shift()!);
        }
        tenant = paths.shift()!;
        tenant = tenant == "default" ? "" : tenant;
        group = paths.shift()!;
        dataId = paths.shift()!;
        return { tenant, group, dataId, type: this.extractConfigTypeWithDataId(dataId), id };
    }

    static getApiInstanceUri(uri: vscode.Uri) {
        const paths = uri.path.split('/');
        paths.shift()!; // skip empty string
        const index = parseInt(paths.shift()!);
        return NacosApi.getInstanceByIndex(index);
    }

    private static extractConfigTypeWithDataId(dataId: string) {
        let type = NacosConfigType.TEXT;
        const dataSpl = dataId.split(".");
        if (dataSpl.length > 1) {
            type = dataSpl[dataSpl.length - 1] as NacosConfigType;
        }
        return type;
    }
}