import { BaseOptions } from "@src/common"

export enum ThrottlerStorageType {
    Redis = "redis",
    Memory = "memory"
}

export interface ThrottlerOptions extends BaseOptions {
    storageType?: ThrottlerStorageType
}
