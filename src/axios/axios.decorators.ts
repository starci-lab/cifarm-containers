import { Inject } from "@nestjs/common"
import { AxiosType } from "./axios.constants"
import { getAxiosToken } from "./axios.utils"

export const InjectAxios = (type: AxiosType = AxiosType.NoAuth) => Inject(getAxiosToken(type))