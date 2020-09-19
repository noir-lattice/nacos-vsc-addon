import * as vscode from "vscode";
import { UriUtils } from "../../utils/uri";

/**
 * Nacos config readonly file system support provider
 */
export class NacosConfigReadonlyFsProvider implements vscode.TextDocumentContentProvider {

    async provideTextDocumentContent(uri: vscode.Uri) {
        let options = UriUtils.toNacosConfig(uri);
        const config = await UriUtils.getApiInstanceUri(uri).getConfig(options);
        return config.content;
    }
};