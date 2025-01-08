import { Inject } from "@nestjs/common"
import { CACHE_MANAGER } from "./cache.constants"

export const InjectCache = () => Inject(CACHE_MANAGER)