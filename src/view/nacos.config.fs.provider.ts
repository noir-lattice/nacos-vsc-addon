import { FileSystemProvider, Event, Uri, Disposable } from "vscode";
import * as vscode from "vscode";
import NacosApi from "../api/api.facade";
import { TextEncoder } from "util";
import { NacosConfig, NacosConfigType } from "../api/config.api";
import { NacosConfigProvider } from "./nacos.config.provider";



/**
 * Nacos config file system support provider
 */
export class NacosConfigFileSystemProvider implements FileSystemProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: Event<vscode.FileChangeEvent[]> = this.onDidChangeEmitter.event;

    constructor(
        private api: NacosApi,
        private nacosConfigProvider: NacosConfigProvider,
    ) { }

    watch(uri: Uri, options: { recursive: boolean; excludes: string[]; }): Disposable {
        return new Disposable(() => {
            console.log(uri.toString);
            console.log(options);
        });
    }

    stat(uri: Uri): vscode.FileStat {
        return { type: vscode.FileType.File } as any;
    }

    readDirectory(uri: Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        throw new Error("Method(readDirectory) not implemented.");
    }

    createDirectory(uri: Uri): void | Thenable<void> {
        throw new Error("Method(createDirectory) not implemented.");
    }

    async readFile(uri: Uri) {
        let options = NacosConfigFileSystemProvider.extractNacosConfigOps(uri);
        const config = await this.api.getConfig(options);
        return new TextEncoder().encode(config.content);
    }

    async writeFile(uri: Uri, content: Uint8Array) {
        let nacosConfigOptions = NacosConfigFileSystemProvider.extractNacosConfigOps(uri);
        let originConfig = await this.api.getConfig(nacosConfigOptions);
        originConfig = originConfig || nacosConfigOptions;
        originConfig.content = content.toString();
        const state = await vscode.window.showInformationMessage(`Confirm delete config "${originConfig.dataId}"?`, "Cancel", "Allow");
        if (state === "Allow") {
            if (!await this.api.saveConfig(originConfig).catch(err => console.log(err.response))) {
                throw new Error("Save nacos config file faild");
            } else {
                this.nacosConfigProvider.refresh();
            }
        } else {
            throw new Error("Cancel save nacos config file");
        }
    }

    delete(uri: Uri, options: { recursive: boolean; }): void | Thenable<void> {
        throw new Error("Method(delete) not implemented.");
    }

    rename(oldUri: Uri, newUri: Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        throw new Error("Method(rename) not implemented.");
    }

    /**
     * extract nacos config options with path
     * @param uri vscode uri
     */
    static extractNacosConfigOps(uri: Uri): Partial<NacosConfig> {
        const paths = uri.path.split('/');
        let tenant: string, group: string, dataId: string;
        tenant = paths[1] == "default" ? "" : paths[1];
        group = paths[2];
        dataId = paths[3];
        return { tenant, group, dataId, type: this.extractConfigTypeWithDataId(dataId) };
    }

    static extractConfigTypeWithDataId(dataId: string) {
        let type = NacosConfigType.TEXT;
        const dataSpl = dataId.split(".");
        if (dataSpl.length > 1) {
            type = dataSpl[dataSpl.length - 1] as NacosConfigType;
        }
        return type;
    }
}