import { RestfulApi } from "./base/api.base";
import { NamspaceApi, Namespace } from "./namespace.api";
import { NacosConfigApi, NacosConfig, NacosConfigQueryOptions } from "./config.api";
import { AuthApi, SignInRepose } from "./auth.api";

class NacosApi extends RestfulApi implements NamspaceApi, NacosConfigApi, AuthApi {

    constructor(private options: NacosOptions) {
        super();
        this.baseUrl = options.url;
        if ((options as TokenOptions).accessToken) {
            this.accessToken = (options as TokenOptions).accessToken;
        }
        this.initHttp();
    }
    
    /** auth api */
    signIn!: (options: AuthOptions) => Promise<SignInRepose>;

    /** Namespace api */
    getAllNamespace!: () => Promise<Array<Namespace>>;

    /** Nacos config api */
    getAllConfig!: (options: NacosConfigQueryOptions) => Promise<Array<NacosConfig>>;
    getConfig!: (options: NacosConfigQueryOptions) => Promise<NacosConfig>;
    saveConfig!: (options: NacosConfigQueryOptions) => Promise<boolean>;
}

applyMixins(NacosApi, [NamspaceApi, NacosConfigApi, AuthApi]);

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