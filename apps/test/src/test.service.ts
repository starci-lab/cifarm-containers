import { Inject, Injectable } from "@nestjs/common"
import { AXIOS_INSTANCE_TOKEN } from "@src/axios"
import { AxiosInstance } from "axios"

@Injectable()
export class TestService {

    //constructor
    constructor(
        @Inject(AXIOS_INSTANCE_TOKEN)
        private readonly axios: AxiosInstance,
    ){
        console.log("default axios", this.axios)
    }
    getHello(): string {
        return "Hello World!"
    }
}
