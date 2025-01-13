import { Injectable } from "@nestjs/common"
import { AxiosType, InjectAxios } from "@src/axios"
import { AxiosInstance } from "axios"

@Injectable()
export class TestService {

    //constructor
    constructor(
        @InjectAxios({
            type: AxiosType.AxiosWithNoAuth
        })
        private readonly axios: AxiosInstance,

        @InjectAxios({
            type: AxiosType.AxiosWithAuth
        })
        private readonly axiosAuth: AxiosInstance,
    ){
        console.log("default axios", this.axios)
        console.log("auth axios", this.axiosAuth)
    }
    getHello(): string {
        return "Hello World!"
    }
}
