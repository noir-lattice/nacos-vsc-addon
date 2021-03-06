import * as vscode from 'vscode';
import NacosApi from '../api/api.facade';
import { PageResponse } from '../api/base/api.base';
import { NacosConfig } from '../api/config.api';
import { UriUtils } from '../utils/uri';
import { NacosConfigItem } from './item/node.item.provider';

export function registerHistory(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('nacos-configurer.historyConfig', async (configNode: NacosConfigItem) => {

        // Create and show panel
        const panel = vscode.window.createWebviewPanel(
            'historyConfig',
            'Config History',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.action) {
                    case 'diff':
                        openDiff(configNode, message);
                        return;
                    case 'rollback':
                        rollbackConfig(configNode.api, configNode, message);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );

        // And set its HTML content
        let page = await configNode.api.getConfigHistoryPage(configNode.nacosConfig);
        panel.webview.html = getWebviewContent(page);
        // reload all history
        page = await configNode.api.getConfigHistoryPage({
            ...configNode.nacosConfig,
            pageSize: page.totalCount,
        });
        panel.webview.html = getWebviewContent(page);

    });
}

async function rollbackConfig(api: NacosApi, configNode: NacosConfigItem, message: any) {
    const state = await vscode.window.showInformationMessage(`Confirm rollback config "${configNode.nacosConfig.dataId}" to ${message.id}?`, "Cancel", "Allow");
    if (state === "Allow") {
        const oldConfig = await api.getConfigHistory({
            ...configNode.nacosConfig,
            id: message.id
        });
        if (await api.saveConfig(oldConfig)) {
            vscode.window.showInformationMessage(`Rollback successful: ${configNode.nacosConfig.dataId}:${message.id}`);
        }
    }
}

function openDiff(configNode: NacosConfigItem, message: any) {
    vscode.commands.executeCommand("vscode.diff",
        UriUtils.toWritableUri(configNode.nacosConfig, configNode.api.instanceCounter),
        UriUtils.toHistoryUri(configNode.nacosConfig, message.id, configNode.api.instanceCounter),
        `${configNode.nacosConfig.dataId} ⇋ ${configNode.nacosConfig.dataId}:${message.id}`);
}

function getWebviewContent(page: PageResponse<NacosConfig>) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
    <style type="text/css">
        table.altrowstable {
            font-family: verdana,arial,sans-serif;
            font-size:11px;
            border-width: 1px;
            border-color: #a9c6c9;
            border-collapse: collapse;
        }
        table.altrowstable th {
            border-width: 1px;
            padding: 8px;
            border-style: solid;
            border-color: #a9c6c9;
        }
        table.altrowstable td {
            border-width: 1px;
            padding: 8px;
            border-style: solid;
            border-color: #a9c6c9;
        }
        .oddrowcolor{
            background-color:#d4e3e5;
        }
        .evenrowcolor{
            background-color:#c3dde0;
        }
    </style>
</head>
<body>
<span>Total count: ${page.totalCount}</span>
<table class="altrowstable" id="alternatecolor">
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