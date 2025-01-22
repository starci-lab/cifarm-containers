import { Platform } from "../blockchain.config"

export const getBlockchainAuthServiceToken = (
    platform: Platform = Platform.Evm
) => {
    return `AuthBlockchainService${platform}`
}
