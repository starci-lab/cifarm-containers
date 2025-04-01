import { SetMetadata } from "@nestjs/common"
import { ThrottlerName } from "./throttler.module"

export const METADATA_KEY = "throttler:name"

export const UseThrottlerName = (name: ThrottlerName = ThrottlerName.Medium) => SetMetadata(METADATA_KEY, name)
