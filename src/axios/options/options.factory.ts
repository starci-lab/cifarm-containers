import { HttpModuleOptionsFactory } from "@nestjs/axios"
import { Inject, Injectable } from "@nestjs/common"
import { AxiosRequestConfig } from "axios"
import { axiosMap, AxiosType, AxiosValues } from "../axios.constants"
import { MODULE_OPTIONS_TOKEN } from "./options.module-definition"
import { AxiosOptionsOptions } from "./options.types"

@Injectable()
export class AxiosOptionsFactory implements HttpModuleOptionsFactory {
    private readonly axiosValues : AxiosValues

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: AxiosOptionsOptions,
    ) {
        options.options.type = options.options.type || AxiosType.NoAuth
        this.axiosValues = axiosMap[this.options.options.type]
    }
    createHttpOptions(): Promise<AxiosRequestConfig> | AxiosRequestConfig {
        return this.axiosValues.config
    }
}
