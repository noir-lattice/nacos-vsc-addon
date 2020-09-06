import { RestfulApi } from "./base/api.base";
import { AuthOptions } from "./api.facade";

const signInUrl = "/v1/auth/users/login";

export interface SignInRepose {
    accessToken: string;
    globalAdmin: boolean;
    tokenTtl: number;
}

export class AuthApi extends RestfulApi {

    async signIn(options: AuthOptions): Promise<SignInRepose> {
        this.baseUrl = options.url;
        const res = await this.http.post<SignInRepose>(signInUrl, null, {
            params: { 
                username: options.username, 
                password: options.password 
            }
        });
        this.accessToken = res.data.accessToken;
        return res.data;
    }

}
