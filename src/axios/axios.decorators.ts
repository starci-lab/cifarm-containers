import { Inject } from "@nestjs/common"
import { AXIOS } from "./axios.constants"

export const InjectAxios = () => Inject(AXIOS)