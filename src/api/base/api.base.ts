import axios, { AxiosStatic } from 'axios';

export class RestfulApi {
    http!: AxiosStatic;

    baseUrl!: string;

    accessToken!: string | undefined;

    public initHttp() {
        this.http = axios;
        axios.interceptors.request.use(config => {
            config.baseURL = this.baseUrl;
            if (this.accessToken) {
                config.params = config.params || {};
                config.params.accessToken = this.accessToken;
            }
            return config;
        });
    }
}

export interface CommonResponse<T> {
    code: number;
    data: T;
    message: string;
}

export interface PageResponse<T> {
    pageItems: Array<T>,
    pageNumber: number;
    pagesAvailable: number;
    totalCount: number;
}