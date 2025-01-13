import Axios from "axios"
import axiosRetry from "axios-retry"
import { axiosConfigs } from "./axios.constants"
import { AxiosInstanceConfig, AxiosOptions } from "./axios.types"

export const getAxiosToken = (options: AxiosOptions) => {
    return axiosConfigs[options.type].injectionToken
}

export const createAxiosInstance = (config?: AxiosInstanceConfig) => {
    const axiosInstance = Axios.create(config)
    axiosRetry(axiosInstance, config)
    return axiosInstance
}