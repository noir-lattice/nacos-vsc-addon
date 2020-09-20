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

export interface ServiceDetail {
    clusters: ClusterInfo[];
    service: ServiceInfo;
}

export interface ServiceInstanceDetail {
    list: ServiceInstanceInfo[];
    count: number;
}

export interface ServiceInstanceInfo {
    clusterName: string;
    enabled: boolean;
    ephemeral: boolean;
    healthy: boolean;
    instanceHeartBeatInterval: number;
    instanceHeartBeatTimeOut: number;
    instanceId: string;
    ip: string;
    ipDeleteTimeout: number;
    lastBeat: number;
    marked: boolean;
    metadata: any;
    port: number;
    serviceName: string;
    weight: number;
}

export interface ServiceInfo {
    groupName: string;
    metadata: any;
    name: string;
    protectThreshold: number;
}

export interface ClusterInfo {
    defaultCheckPort: number;
    defaultPort: number;
    healthChecker: { type: string }
    metadata: any;
    name: string;
    serviceName: string;
    useIPPort4Check: boolean;
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
const serviceDetailUrl = '/v1/ns/catalog/service';
const servicesActUrl = '/v1/ns/service'
const instanceUrl = '/v1/ns/catalog/instances';

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

    async getDetail(opt: NacosService) {
        const result = await this.http.get<ServiceDetail>(serviceDetailUrl, {
            params: {
                serviceName: opt.name,
                groupName: opt.groupName,
                namespaceId: opt.namespaceId
            }
        });
        return result.data;
    }

    async getAllInstance(opt: NacosService, clusterName: string, count?: number): Promise<ServiceInstanceDetail> {
        const result = await this.http.get<ServiceInstanceDetail>(instanceUrl, {
            params: {
                serviceName: opt.name,
                groupName: opt.groupName,
                namespaceId: opt.namespaceId,
                clusterName,
                pageSize: 10,
                pageNo: 1
            }
        });
        const data = result.data;
        if (data.count > data.list.length) {
            return this.getAllInstance(opt, clusterName, data.count);
        }
        return data;
    }
}

