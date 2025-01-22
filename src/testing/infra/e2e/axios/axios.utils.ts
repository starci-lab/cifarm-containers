import { AxiosType } from "./axios.types"

export const getAxiosToken = (type: AxiosType = AxiosType.NoAuth) => {
    return `axios-${type}`
}
