import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/fs/nacos.config.fs.provider';
import { NacosConfigReadonlyFsProvider } from './view/fs/nacos.config.readonly.fs.provider';
import { NacosConfigHistoryFsProvider } from './view/fs/nacos.config.history.fs.provider';
import { NaconfigFileSystemType } from './constants/constants';
import { NacosDiscoveryProvider } from './view/nacos.discovery.provider';

export async function activate(ctx: vscode.ExtensionContext) {
	const nacosConfigurer = new NacosConfigProvider(ctx);
	const nacosDiscovery = new NacosDiscoveryProvider();
	const nacosConfigurerFs = new NacosConfigFileSystemProvider(nacosConfigurer);
	const nacosConfigurerReadFs = new NacosConfigReadonlyFsProvider();
	const nacosConfigurerHistoryFs = new NacosConfigHistoryFsProvider();

	// add nacos file system support
	vscode.workspace.registerFileSystemProvider(NaconfigFileSystemType.WRITABLE, nacosConfigurerFs);
	// add nacos readonly file system support
	vscode.workspace.registerTextDocumentContentProvider(NaconfigFileSystemType.READONLY, nacosConfigurerReadFs);
	// add nacos history file system support
	vscode.workspace.registerTextDocumentContentProvider(NaconfigFileSystemType.HISTORY, nacosConfigurerHistoryFs);
	// add viewer
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);
	vscode.window.registerTreeDataProvider('nacos-discovery', nacosDiscovery);
}

// this method is called when your extension is deactivated
export function deactivate() { }


