import * as vscode from "vscode";
import NacosApi from "../../api/api.facade";
import { NacosConfig } from "../../api/config.api";
import { UriUtils } from "../../utils/uri";

/**
 * Nacos config readonly file system support provider
 */
export class NacosConfigHistoryFsProvider implements vscode.TextDocumentContentProvider {
    constructor(
        private api: NacosApi,
    ) { }

    async provideTextDocumentContent(uri: vscode.Uri) {
        let options = UriUtils.toNacosConfig(uri);
        const config = await this.api.getConfigHistory(options as NacosConfig);
        return config.content;
    }

};