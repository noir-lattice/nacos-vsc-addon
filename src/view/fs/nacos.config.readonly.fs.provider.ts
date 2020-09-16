import * as vscode from "vscode";
import NacosApi from "../../api/api.facade";
import { NacosConfigFileSystemProvider } from "./nacos.config.fs.provider";

/**
 * Nacos config readonly file system support provider
 */
export class NacosConfigReadonlyFsProvider implements vscode.TextDocumentContentProvider {
    constructor(
        private api: NacosApi,
    ) { }

    async provideTextDocumentContent(uri: vscode.Uri) {
        let options = NacosConfigFileSystemProvider.extractNacosConfigOps(uri);
        const config = await this.api.getConfig(options);
        return config.content;
    }
};