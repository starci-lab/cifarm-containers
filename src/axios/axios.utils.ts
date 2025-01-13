import Axios from "axios"
import axiosRetry from "axios-retry"
import { axiosMap } from "./axios.constants"
import { AxiosInstanceConfig, AxiosOptions } from "./axios.types"

export const getAxiosToken = (options: AxiosOptions) => {
    return axiosMap[options.type].injectionToken
}

export const createAxiosInstance = (config?: AxiosInstanceConfig) => {
    const axiosInstance = Axios.create(config)
    axiosRetry(axiosInstance, config)
    return axiosInstance
}