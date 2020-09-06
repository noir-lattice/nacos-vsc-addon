import { FileSystemProvider, Event, Uri, Disposable } from "vscode";
import * as vscode from "vscode";
import NacosApi from "../api/api.facade";
import { TextEncoder } from "util";
import { NacosConfig } from "../api/config.api";

const api = new NacosApi({
    url: "http://192.168.3.50:8848/nacos",
    accessToken: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYWNvcyIsImV4cCI6MTU5NzAwMTM0MH0.8G_L1gb8nCyMK-ZLzS_kIm4r4kR4IpFkY9NBFX3k39E"
});

export class NacosConfigFileSystemProvider implements FileSystemProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: Event<vscode.FileChangeEvent[]> = this.onDidChangeEmitter.event;

    watch(uri: Uri, options: { recursive: boolean; excludes: string[]; }): Disposable {
        return new Disposable(() => {
            console.log(uri.toString);
            console.log(options);
        });
    }

    stat(uri: Uri): vscode.FileStat {
       return { type: vscode.FileType.File } as any;
    }

    readDirectory(uri: Uri): [string, import("vscode").FileType][] | Thenable<[string, import("vscode").FileType][]> {
        throw new Error("Method(readDirectory) not implemented.");
    }

    createDirectory(uri: Uri): void | Thenable<void> {
        throw new Error("Method(createDirectory) not implemented.");
    }

    async readFile(uri: Uri) {
        let options = this.extractNacosConfigOps(uri);
        const config = await api.getConfig(options);
        return new TextEncoder().encode(config.content);
    }

    async writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }) {
        let nacosConfigOptions = this.extractNacosConfigOps(uri);
        nacosConfigOptions.content = content.toString();
        if (!await api.saveConfig(nacosConfigOptions).catch(err => console.log(err.response))) {
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