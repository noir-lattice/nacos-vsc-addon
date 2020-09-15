import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/nacos.config.fs.provider';
import { createApiHandleWithNacosConfig } from './auth/auth.options.load';


export async function activate(context: vscode.ExtensionContext) {
	const api = await createApiHandleWithNacosConfig();
	const nacosConfigurer = new NacosConfigProvider(api);
	const nacosCOnfigurerFs = new NacosConfigFileSystemProvider(api);
	// add nacos fils system support
	vscode.workspace.registerFileSystemProvider("nacos-configurer", nacosCOnfigurerFs);
	// add viewer
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);
}

// this method is called when your extension is deactivated
export function deactivate() { }
