import Axios from "axios"
import axiosRetry from "axios-retry"
import { AxiosInstanceConfig, AxiosOptions } from "./axios.types"

export const getAxiosToken = (options: AxiosOptions) => {
    return `${options.type}`
}

export const createAxiosInstance = (config?: AxiosInstanceConfig) => {
    const axiosInstance = Axios.create(config)
    axiosRetry(axiosInstance, config)
    return axiosInstance
}