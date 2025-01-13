import { Inject } from "@nestjs/common"
import { AxiosOptions } from "./axios.types"
import { getAxiosToken } from "./axios.utils"

export const InjectAxios = (options: AxiosOptions = {}) => Inject(getAxiosToken(options))