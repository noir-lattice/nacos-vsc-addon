import { RestfulApi, CommonResponse } from './base/api.base';

export interface Namespace {
    namespace: string;
    namespaceShowName: string;
    configCount: number;
    quota: number;
    type: number;
}

const namespaceUrl = "/v1/console/namespaces";

export class NamspaceApi extends RestfulApi {

    async getAllNamespace(): Promise<Array<Namespace>> {
        const res = await this.http.get<CommonResponse<Array<Namespace>>>(namespaceUrl);
        return res.data.data;
    }

}
