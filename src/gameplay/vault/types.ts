import { VaultInfoData } from "@src/databases"
import { ChainKey, Network } from "@src/env"

export interface ComputePaidAmountParams {
    network: Network
    chainKey: ChainKey
    vaultInfoData: VaultInfoData
}



