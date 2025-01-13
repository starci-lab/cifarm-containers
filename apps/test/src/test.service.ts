import { Injectable } from "@nestjs/common"
import { AxiosType, InjectAxios } from "@src/axios"
import { AxiosInstance } from "axios"

@Injectable()
export class TestService {
    private readonly _axios: AxiosInstance

    //constructor
    constructor(
        @InjectAxios(AxiosType.NoAuth)
        private readonly axios: AxiosInstance,
    ){
        this._axios = axios

        this.getHello()
    }
    async getHello(): Promise<void> {
        const { data } = await this.axios.get("https://jsonplaceholder.typicode.com/posts")
        console.log(data)
    }
}
