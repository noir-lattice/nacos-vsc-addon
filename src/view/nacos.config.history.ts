import * as vscode from 'vscode';
import NacosApi from '../api/api.facade';
import { PageResponse } from '../api/base/api.base';
import { NacosConfig } from '../api/config.api';
import { string10to62 } from '../utils/number';
import { NacosConfigItem } from './nacos.config.provider';

export function registerHistory(api: NacosApi, context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('nacos-configurer.historyConfig', async (configNode: NacosConfigItem) => {

        const page = await api.getConfigHistoryPage(configNode.nacosConfig);
        // Create and show panel
        const panel = vscode.window.createWebviewPanel(
            'historyConfig',
            'Config History',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        // And set its HTML content
        panel.webview.html = getWebviewContent(page);

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.action) {
                    case 'diff':
                        vscode.commands.executeCommand("vscode.diff",
                            vscode.Uri.parse(`nacos-configurer:/${configNode.nacosConfig.tenant || 'default'}/${configNode.nacosConfig.group}/${configNode.nacosConfig.dataId}`),
                            vscode.Uri.parse(`nacos-configurer-history:/${string10to62(message.id)}/${configNode.nacosConfig.tenant || 'default'}/${configNode.nacosConfig.group}/${configNode.nacosConfig.dataId}`),
                            `${configNode.nacosConfig.dataId} ⇋ ${configNode.nacosConfig.dataId}:${message.id}`);
                        return;
                    case 'rollback':
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });
}

function getWebviewContent(page: PageResponse<NacosConfig>) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
<table border="1">
<tr>
  <th>Id</th>
  <th>LastModifiedTime</th>
  <th>Action</th>
</tr>
${page.pageItems.map(config => `<tr><td>${config.id}</td><td>${config.lastModifiedTime}</td><td><button type="button" onclick="diff('${config.id}')">diff</button><button type="button" onclick="rollback('${config.id}')">rollback</button></td></tr>`)}
</table>

<script>
    let vscode;
    (function() {
        vscode = acquireVsCodeApi();
    }())

    function diff(id){
        vscode.postMessage({
            action: 'diff',
            id: id,
        });
    }

    function rollback(id){
        vscode.postMessage({
            action: 'rollback',
            id: id,
        });
    }
</script>
</body>
</html>`;
}