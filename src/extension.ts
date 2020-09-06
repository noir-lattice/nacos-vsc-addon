import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider(
		'nacos-configurer',
		new NacosConfigProvider()
	);
}

// this method is called when your extension is deactivated
// 此方法在停用插件时调用
export function deactivate() {}
