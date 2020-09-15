import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/nacos.config.fs.provider';
import { createApiHandleWithNacosConfig } from './auth/auth.options.load';
import { NacosConfigReadonlyFsProvider } from './view/nacos.config.readonly.fs.provider';


export async function activate(context: vscode.ExtensionContext) {
	const api = await createApiHandleWithNacosConfig();
	const nacosConfigurer = new NacosConfigProvider(api);
	const nacosConfigurerFs = new NacosConfigFileSystemProvider(api, nacosConfigurer);
	const nacosConfigurerReadFs = new NacosConfigReadonlyFsProvider(api);
	
	// add nacos file system support
	vscode.workspace.registerFileSystemProvider("nacos-configurer", nacosConfigurerFs);
	// add nacos readonly file system support
	vscode.workspace.registerTextDocumentContentProvider("nacos-configurer-read", nacosConfigurerReadFs);
	// add viewer
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);
}

// this method is called when your extension is deactivated
export function deactivate() { }
