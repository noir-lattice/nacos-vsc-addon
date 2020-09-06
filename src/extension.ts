import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';

const nacosConfigurer = new NacosConfigProvider();


export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.registerTextDocumentContentProvider("nacos-configurer", nacosConfigurer);
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);
}

// this method is called when your extension is deactivated
// 此方法在停用插件时调用
export function deactivate() {}
