
import * as vscode from "vscode";

import { PageResponse, RestfulApi } from "./base/api.base";
import { NamspaceApi, Namespace, NamespaceCreteOptions } from "./namespace.api";
import { NacosConfigApi, NacosConfig, NacosConfigQueryOptions } from "./config.api";
import { AuthApi, SignInRepose } from "./auth.api";
import { NacosService, NacosServiceApi } from "./services.api";

const apiContainer: NacosApi[] = [];
let instanceCounter = 0;

class NacosApi extends RestfulApi implements NamspaceApi, NacosConfigApi, AuthApi, NacosServiceApi {
    
    static getInstanceByIndex(index: number) {
        return apiContainer[index];
    }
    
    instanceCounter: number;

    constructor(public options: NacosOptions) {
        super();
        this.baseUrl = options.url;
        apiContainer.push(this);
        this.instanceCounter = instanceCounter++;
        if ((options as TokenOptions).accessToken) {
            this.accessToken = (options as TokenOptions).accessToken;
        }
        this.initHttp();

        // token expire
        this.errCallback.push(async res => {
            if (res.status === 403) {
                try {
                    await this.signIn(this.options as AuthOptions);
                } catch {
                    vscode.window.showErrorMessage("Authentication fail, please reset service config")
                }
            }
        });
    }

    /** auth api */
    signIn!: (options: AuthOptions) => Promise<SignInRepose>;

    /** Namespace api */
    getAllNamespace!: () => Promise<Array<Namespace>>;
    getNamespace!: (namespaceId: string) => Promise<Namespace>;
    createNamespace!: (options: NamespaceCreteOptions) => Promise<boolean>;
    deleteNamespace!: (namespaceId: string) => Promise<boolean>;
    updateNamespace!: (options: NamespaceCreteOptions) => Promise<boolean>;

    /** Nacos config api */
    getAllConfig!: (options: NacosConfigQueryOptions) => Promise<Array<NacosConfig>>;
    getConfig!: (options: NacosConfigQueryOptions) => Promise<NacosConfig>;
    saveConfig!: (options: NacosConfigQueryOptions) => Promise<boolean>;
    deleteConfig!: (options: NacosConfig) => Promise<boolean>;
    getConfigHistoryPage!: (options: NacosConfigQueryOptions) => Promise<PageResponse<NacosConfig>>;
    getConfigHistory!: (options: NacosConfig) => Promise<NacosConfig>;

    /** Nacos service api */
    getAllService!: (namespaceId: string) => Promise<Array<NacosService>>;
}

applyMixins(NacosApi, [NamspaceApi, NacosConfigApi, AuthApi, NacosServiceApi]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}


export interface TokenOptions {
    url: string;
    accessToken: string;
}

export interface AuthOptions {
    url: string;
    username: string;
    password: string;
}

export type NacosOptions = TokenOptions | AuthOptions;

export default NacosApi;