import { Network } from "@src/env"

export const HONEYCOMB_TESTNET_EDGE_CLIENT_URL= "https://edge.test.honeycombprotocol.com"
export const HONEYCOMB_MAINNET_EDGE_CLIENT_URL= "https://edge.main.honeycombprotocol.com"

export const edgeClientUrlMap: Record<Network, string> = {
    [Network.Testnet]: HONEYCOMB_TESTNET_EDGE_CLIENT_URL,
    [Network.Mainnet]: HONEYCOMB_MAINNET_EDGE_CLIENT_URL
}