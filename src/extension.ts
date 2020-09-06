import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/nacos.config.fs.provider';

const nacosConfigurer = new NacosConfigProvider();
const nacosCOnfigurerFs = new NacosConfigFileSystemProvider();

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.registerFileSystemProvider("nacos-configurer", nacosCOnfigurerFs);
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);
}

// this method is called when your extension is deactivated
// 此方法在停用插件时调用
export function deactivate() {}
