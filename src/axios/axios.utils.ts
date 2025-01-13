import { axiosMap, AxiosType } from "./axios.constants"

export const getAxiosToken = (type: AxiosType) => {
    return `${axiosMap[type]}_Token`
}