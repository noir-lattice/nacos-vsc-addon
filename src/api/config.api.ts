/* eslint-disable @typescript-eslint/naming-convention */
import { RestfulApi, PageResponse } from './base/api.base';

export enum NacosConfigType {
    TEXT = "text",
    JSON = "json",
    XML = "xml",
    YAML = "yaml",
    HTML = "html",
    PROPERTIES = "properties"
}

export interface NacosConfig {
    content: string;
    appName: string;
    dataId: string;
    group: string;
    id?: number;
    lastModifiedTime?: string;
    tenant: string;
    type: NacosConfigType;
}

export interface NacosConfigCreateOptions extends NacosConfig {
    namespaceId: string;
}

export class NacosConfigQueryOptions {
    dataId?: string = "";
    group?: string = "";
    appName?: string = "";
    config_tags?: string = "";
    pageNo?: number = 1;
    pageSize?: number = 10;
    tenant?: string = "";
    search?: string = "accurate";
}

const configUrl = "/v1/cs/configs";
const historyUrl = "/v1/cs/history";

export class NacosConfigApi extends RestfulApi {

    async getAllConfig(options: NacosConfigQueryOptions): Promise<Array<NacosConfig>> {
        const res = await this.http.get<PageResponse<NacosConfig>>(configUrl, {
            params: {
                ...new NacosConfigQueryOptions(),
                ...options
            }
        });
        return res.data.pageItems;
    }

    async getConfig(options: NacosConfigQueryOptions): Promise<NacosConfig> {
        const res = await this.http.get<NacosConfig>(configUrl, {
            params: {
                ...options,
                show: "all"
            }
        });
        return res.data;
    }

    async saveConfig(options: NacosConfigQueryOptions): Promise<boolean> {
        const status = await this.http.post<boolean>(configUrl, undefined, {
            params: options
        });
        return status.data;
    }

    async deleteConfig(options: NacosConfig): Promise<boolean> {
        const status = await this.http.delete<boolean>(configUrl, {
            params: options
        });
        return status.data;
    }

    async getConfigHistoryPage(options: NacosConfigQueryOptions): Promise<PageResponse<NacosConfig>> {
        const res = await this.http.get<PageResponse<NacosConfig>>(historyUrl, {
            params: {
                ...new NacosConfigQueryOptions(),
                ...options
            }
        });
        return res.data;
    }

    async getConfigHistory(options: NacosConfig): Promise<NacosConfig> {
        const res = await this.http.get<NacosConfig>(historyUrl, {
            params: {
                ...options,
                nid: options.id
            }
        });
        return res.data;
    }
}
