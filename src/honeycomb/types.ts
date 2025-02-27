import { BaseOptions } from "@src/common"
import { Network } from "@src/env"

export interface HoneycombOptions extends BaseOptions {
    // the private keys for the networks
    authorityPrivateKeys?: Record<Network, string | undefined>
}