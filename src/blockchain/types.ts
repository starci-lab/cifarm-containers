import { BaseOptions } from "@src/common"
import { Network } from "@src/env"

export interface WithNetwork {
    network?: Network 
}

export interface WithFeePayer extends WithNetwork {
    feePayer?: string
}

export type BlockchainOptions = BaseOptions