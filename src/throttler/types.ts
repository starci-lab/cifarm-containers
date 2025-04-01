import { BaseOptions } from "@src/common"
import { ThrottlerOptions as NestThrottlerOptions } from "@nestjs/throttler"
export enum ThrottlerStorageType {
    Redis = "redis",
    Memory = "memory"
}

export interface ThrottlerOptions extends BaseOptions {
    storageType?: ThrottlerStorageType
    overrideThrottlers?: Array<NestThrottlerOptions> 
}
