import * as vscode from "vscode";
import NacosApi from "../api/api.facade";
import { string62to10 } from "../utils/number";

/**
 * Nacos config readonly file system support provider
 */
export class NacosConfigHistoryFsProvider implements vscode.TextDocumentContentProvider {
    constructor(
        private api: NacosApi,
    ) { }

    async provideTextDocumentContent(uri: vscode.Uri) {
        let options = this.extractNacosConfigOps(uri);
        const config = await this.api.getConfigHistory(options);
        return config.content;
    }

    private extractNacosConfigOps(uri: vscode.Uri): any {
        const paths = uri.path.split('/');
        let tenant: string, group: string, dataId: string, id: string;
        id = string62to10(paths[1]) + '';
        tenant = paths[2] == "default" ? "" : paths[1];
        group = paths[3];
        dataId = paths[4];
        return { tenant, group, dataId, id };
    }
};