/* eslint-disable @typescript-eslint/naming-convention */
import { RestfulApi, CommonResponse, PageResponse } from './base/api.base';

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
    id: number;
    tenant: string;
    type: NacosConfigType;
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

const namespaceUrl = "/v1/cs/configs";

export class NacosConfigApi extends RestfulApi {

    async getAllConfig(options: NacosConfigQueryOptions): Promise<Array<NacosConfig>> {
        const res = await this.http.get<PageResponse<NacosConfig>>(namespaceUrl, {
            params: {
                ...new NacosConfigQueryOptions(),
                ...options
            }
        });
        return res.data.pageItems;
    }

    async getConfigContent(options: NacosConfigQueryOptions): Promise<NacosConfig> {
        const res = await this.http.get<NacosConfig>(namespaceUrl, {
            params: {
                ...options,
                show: "all"
            }
        });
        return res.data;
    }
}
