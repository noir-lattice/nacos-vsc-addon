import { RestfulApi, CommonResponse } from './base/api.base';

export interface Namespace {
    namespace: string;
    namespaceShowName: string;
    namespaceDesc: string;
    configCount: number;
    quota: number;
    type: number;
}

export interface NamespaceCreteOptions {
    customNamespaceId: string;
    namespaceName: string;
    namespaceDesc: string;
    namespaceId: string;
}

const namespaceUrl = "/v1/console/namespaces";

export class NamspaceApi extends RestfulApi {

    async getAllNamespace(): Promise<Array<Namespace>> {
        const res = await this.http.get<CommonResponse<Array<Namespace>>>(namespaceUrl);
        return res.data.data;
    }

    async getNamespace(namespaceId: string): Promise<Namespace> {
        const res = await this.http.get<Namespace>(namespaceUrl, {
            params: {
                show: "all",
                namespaceId,
            }
        });
        return res.data;
    }

    async createNamespace(options: NamespaceCreteOptions): Promise<boolean> {
        const status = await this.http.post<boolean>(namespaceUrl, undefined, { params: options });
        return status.data;
    }

    async deleteNamespace(namespaceId: string): Promise<boolean> {
        const status = await this.http.delete<boolean>(namespaceUrl, { params: { namespaceId } });
        return status.data;
    }

    async updateNamespace(options: NamespaceCreteOptions): Promise<boolean> {
        const status = await this.http.put<boolean>(namespaceUrl, undefined, { params: options });
        return status.data;
    }

}

