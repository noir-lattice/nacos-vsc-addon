import { RestfulApi } from "./base/api.base";

export interface NacosService {
    clusterCount: number;
    groupName: string;
    healthyInstanceCount: number;
    ipCount: number;
    name: string;
    triggerFlag: boolean;
}

interface ServicePage {
    count: number;
    serviceList: NacosService[];
}

const servicesUrl = '/v1/ns/catalog/services'

export class NacosServiceApi extends RestfulApi {

    async getAllService(namespaceId: string, total?: number): Promise<Array<NacosService>> {
        const res = await this.http.get<ServicePage>(servicesUrl, {
            params: {
                hasIpCount: true,
                withInstances: false,
                pageNo: 1,
                pageSize: total || 100,
                serviceNameParam: "",
                groupNameParam: "",
                namespaceId
            }
        });
        if (res.data.count <= res.data.serviceList.length) {
            return res.data.serviceList;
        } else {
            return this.getAllService(namespaceId, res.data.count);
        }
    }

}

