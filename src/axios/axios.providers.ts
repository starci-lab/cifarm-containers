import { Provider } from "@nestjs/common"
import Axios, { AxiosInstance } from "axios"
import axiosRetry from "axios-retry"
import { axiosMap, AxiosType } from "./axios.constants"
import { getAxiosToken } from "./axios.utils"

export const createAxiosFactoryProvider = (type: AxiosType = AxiosType.NoAuth): Provider => ({
    provide: getAxiosToken(type),
    useFactory: async (): Promise<AxiosInstance> => {
        const config = axiosMap[type].config
        const axiosInstance = Axios.create(config)
        axiosRetry(axiosInstance, config)
        return axiosInstance
    }
})