import * as vscode from 'vscode';
import { NacosConfigProvider } from './view/nacos.config.provider';
import { NacosConfigFileSystemProvider } from './view/nacos.config.fs.provider';
import { createApiHandleWithNacosConfig } from './auth/auth.options.load';


export async function activate(context: vscode.ExtensionContext) {
	const api = await createApiHandleWithNacosConfig();
	const nacosConfigurer = new NacosConfigProvider(api);
	const nacosCOnfigurerFs = new NacosConfigFileSystemProvider(api, nacosConfigurer);
	// add nacos fils system support
	vscode.workspace.registerFileSystemProvider("nacos-configurer", nacosCOnfigurerFs);
	// add viewer
	vscode.window.registerTreeDataProvider('nacos-configurer', nacosConfigurer);

	// vscode.commands.executeCommand("vscode.diff", vscode.Uri.parse(`nacos-configurer:/default/DEFAULT_GROUP/test.yaml`), vscode.Uri.parse(`nacos-configurer:/default/DEFAULT_GROUP/test1.yaml`), "test -> test1", { preview: true})

}

// this method is called when your extension is deactivated
export function deactivate() { }
