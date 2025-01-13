import { Injectable } from "@nestjs/common"
import { InjectAxios } from "@src/axios"
import { AxiosInstance } from "axios"

@Injectable()
export class E2EAuthenticateService {
    constructor(
        @InjectAxios()
        private readonly axios: AxiosInstance
    ) {
    }

    async authenticate(username: string, password: string): Promise<string> {
        const response = await this.axios.post("/auth/login", {
            username,
            password
        })
        return response.data.access_token
    }
}