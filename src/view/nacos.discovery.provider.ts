import * as vscode from "vscode";
import { TreeDataProvider } from "vscode";

import { NacosItem } from "./item/node.item.provider";

export class NacosDiscoveryProvider implements TreeDataProvider<NacosItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NacosItem | undefined> = new vscode.EventEmitter<NacosItem | undefined>();
    onDidChangeTreeData?: vscode.Event<void | NacosItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: NacosItem) {
        return element;
    }
    
    getChildren(element?: NacosItem | undefined): import("vscode").ProviderResult<NacosItem[]> {
        throw new Error("Method not implemented.");
    }
}