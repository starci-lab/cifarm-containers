import { HttpModuleOptions, HttpModuleOptionsFactory } from "@nestjs/axios"
import { Inject, Injectable } from "@nestjs/common"
import { DEFAULT_BASE_URL } from "../axios.constants"
import { ApiVersion, AxiosOptions } from "../axios.types"
import { MODULE_OPTIONS_TOKEN } from "./options.module-definition"
import { AxiosOptionsOptions } from "./options.types"

@Injectable()
export class AxiosOptionsFactory implements HttpModuleOptionsFactory {
    private readonly baseOptions: AxiosOptions
    private readonly apiVersion: ApiVersion
    private readonly baseUrl: string

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: AxiosOptionsOptions,
    ) {
        this.baseOptions = this.options.options || {}
        this.apiVersion = this.baseOptions.apiVersion || ApiVersion.V1
        this.baseUrl = this.baseOptions.baseUrl || DEFAULT_BASE_URL
    }
    createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions {
        return {
            baseURL: `${this.baseUrl}/${this.apiVersion}`
        }
    }
}
