import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/fs/nacos.config.fs.provider';
import { getServiceConfig, openConfigInput } from './auth/auth.options.load';
import { NacosConfigReadonlyFsProvider } from './view/fs/nacos.config.readonly.fs.provider';
import { NacosConfigHistoryFsProvider } from './view/fs/nacos.config.history.fs.provider';
import { NaconfigFileSystemType } from './constants/constants';
import NacosApi, { NacosOptions } from './api/api.facade';

vscode.commands.registerCommand('nacos.updateConnection', async () => {
	let options = await getServiceConfig();
	options = await openConfigInput(options);
	iniExtention(options);
});

let context: vscode.ExtensionContext;

export async function activate(ctx: vscode.ExtensionContext) {
	context = ctx;
	const options = await getServiceConfig();
	iniExtention(options);
}

// this method is called when your extension is deactivated
export function deactivate() { }


function iniExtention(options?: NacosOptions) {
	if (options) {
		const api = new NacosApi(options);
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
}
