import axios, { AxiosStatic } from 'axios';

export class RestfulApi {
    http!: AxiosStatic;

    baseUrl!: string;

    accessToken!: string | undefined;

    errCallback: Array<(res: any) => void | Promise<void>> = [];

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

        axios.interceptors.response.use(async response => {
            const status = response.status;
            if (status !== 200) { 
                for (const cb of this.errCallback) {
                    await cb(response);
                }
                return Promise.reject(response)
            }
            return Promise.resolve(response)
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
