import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/fs/nacos.config.fs.provider';
import { createApiHandleWithNacosConfig } from './auth/auth.options.load';
import { NacosConfigReadonlyFsProvider } from './view/fs/nacos.config.readonly.fs.provider';
import { NacosConfigHistoryFsProvider } from './view/fs/nacos.config.history.fs.provider';
import { NaconfigFileSystemType } from './constants/constants';


export async function activate(context: vscode.ExtensionContext) {
	const api = await createApiHandleWithNacosConfig();
	const nacosConfigurer = new NacosConfigProvider(api, context);
	const nacosConfigurerFs = new NacosConfigFileSystemProvider(api, nacosConfigurer);
	const nacosConfigurerReadFs = new NacosConfigReadonlyFsProvider(api);
	const nacosConfigurerHistoryFs = new NacosConfigHistoryFsProvider(api);

	// add nacos file system support
	vscode.workspace.registerFileSystemProvider(NaconfigFileSystemType.WRITABLE, nacosConfigurerFs);
	// add nacos readonly file system support
	vscode.workspace.registerTextDocumentContentProvider(NaconfigFileSystemType.READONLY, nacosConfigurerReadFs);
	// add nacos history file system support
	vscode.workspace.registerTextDocumentContentProvider(NaconfigFileSystemType.HISTORY, nacosConfigurerHistoryFs);
	// add viewer
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);
}

// this method is called when your extension is deactivated
export function deactivate() { }
