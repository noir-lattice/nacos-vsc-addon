import { RestfulApi } from "./base/api.base";

export interface NacosService {
    clusterCount: number;
    groupName: string;
    healthyInstanceCount: number;
    ipCount: number;
    name: string;
    triggerFlag: boolean;
    namespaceId: string;
}

export interface NacosCreateServiceOptions {
    serviceName: string;
    groupName: string;
    protectThreshold: number;
    metadata: string;
    namespaceId: string;
}

interface ServicePage {
    count: number;
    serviceList: NacosService[];
}

const servicesUrl = '/v1/ns/catalog/services';
const servicesActUrl = '/v1/ns/service'

export class NacosServiceApi extends RestfulApi {

    async getAllService(namespaceId: string, total?: number): Promise<Array<NacosService>> {
        const res = await this.http.get<ServicePage>(servicesUrl, {
            params: {
                hasIpCount: false,
                withInstances: false,
                pageNo: 1,
                pageSize: total || 100,
                serviceNameParam: "",
                groupNameParam: "",
                namespaceId
            }
        });
        res.data.serviceList.forEach(ser => ser.namespaceId = namespaceId);
        if (res.data.count <= res.data.serviceList.length) {
            return res.data.serviceList;
        } else {
            return this.getAllService(namespaceId, res.data.count);
        }
    }

    async deleteService(serv: NacosService) {
        const result = await this.http.delete<boolean>(servicesActUrl, {
            params: {
                serviceName: serv.name,
                groupName: serv.groupName
            },
            data: {
                namespaceId: serv.namespaceId,
            }
        });
        return result.data;
    }

    async createService(opt: NacosCreateServiceOptions) {
        const result = await this.http.post<boolean>(servicesActUrl, undefined, { params: opt });
        return result.data;
    }
}

