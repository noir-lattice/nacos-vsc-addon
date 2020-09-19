import { FileSystemProvider, Event, Uri, Disposable } from "vscode";
import * as vscode from "vscode";
import { TextEncoder } from "util";
import { NacosConfigProvider } from "../nacos.config.provider";
import { UriUtils } from "../../utils/uri";

/**
 * Nacos config file system support provider
 */
export class NacosConfigFileSystemProvider implements FileSystemProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: Event<vscode.FileChangeEvent[]> = this.onDidChangeEmitter.event;

    constructor(
        private nacosConfigProvider: NacosConfigProvider,
    ) { }

    watch(uri: Uri, options: { recursive: boolean; excludes: string[]; }): Disposable {
        return new Disposable(() => {
            // pass
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
        let options = UriUtils.toNacosConfig(uri);
        const config = await UriUtils.getApiInstanceUri(uri).getConfig(options);
        return new TextEncoder().encode(config.content);
    }

    async writeFile(uri: Uri, content: Uint8Array) {
        let nacosConfigOptions = UriUtils.toNacosConfig(uri);
        const api = UriUtils.getApiInstanceUri(uri);
        let originConfig = await api.getConfig(nacosConfigOptions);
        originConfig = originConfig || nacosConfigOptions;
        originConfig.content = content.toString();
        const state = await vscode.window.showInformationMessage(`Confirm update remote config "${originConfig.dataId}"?`, "Cancel", "Allow");
        if (state === "Allow") {
            if (!await api.saveConfig(originConfig).catch(err => console.log(err.response))) {
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

}