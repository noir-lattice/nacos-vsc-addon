import { FileSystemProvider, Event, Uri, Disposable } from "vscode";
import * as vscode from "vscode";
import NacosApi from "../api/api.facade";
import { TextEncoder } from "util";
import { NacosConfig } from "../api/config.api";

/**
 * Nacos config file system support provider
 */
export class NacosConfigFileSystemProvider implements FileSystemProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: Event<vscode.FileChangeEvent[]> = this.onDidChangeEmitter.event;

    constructor(private api: NacosApi) {}

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
        let options = this.extractNacosConfigOps(uri);
        const config = await this.api.getConfig(options);
        return new TextEncoder().encode(config.content);
    }

    async writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }) {
        let nacosConfigOptions = this.extractNacosConfigOps(uri);
        const originConfig = await this.api.getConfig(nacosConfigOptions);
        originConfig.content = content.toString();
        if (!await this.api.saveConfig(originConfig).catch(err => console.log(err.response))) {
            throw new Error("Save nacos config file faild!");
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
    private extractNacosConfigOps(uri: Uri): Partial<NacosConfig> {
        const paths = uri.path.split('/');
        let tenant: string = "", group: string, dataId: string;
        if (paths.length === 3) {
            tenant = paths[0];
            group = paths[1];
            dataId = paths[2];
        }
        else {
            group = paths[0];
            dataId = paths[1];
        }
        return { tenant, group, dataId };
    }

}