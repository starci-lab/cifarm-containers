import { Network } from "@/config"
import { Network as AptosNetwork, Aptos, AptosConfig } from "@aptos-labs/ts-sdk"

export const networkMap: Record<Network, AptosNetwork> = {
    [Network.Mainnet]: AptosNetwork.MAINNET,
    [Network.Testnet]: AptosNetwork.TESTNET
}

export const aptosClient = (network: Network) => {
    const aptosNetwork = networkMap[network]
    const config = new AptosConfig({
        network: aptosNetwork
    })
    return new Aptos(config)
}