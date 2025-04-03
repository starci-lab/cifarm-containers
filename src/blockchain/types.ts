import { BaseOptions } from "@src/common"
import { Network } from "@src/env"

export interface WithNetwork {
    network?: Network 
}

export type BlockchainOptions = BaseOptions