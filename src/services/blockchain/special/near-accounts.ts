import {
    envConfig,
    Network,
    SupportedChainKey,
} from "@src/config"
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { Account } from "near-api-js"
import { nearClient, nearKeyPair, nearKeyStore } from "../rpcs"
import { NearUsernameExistsException } from "@src/exceptions"

export type NearAccounts = Record<Network, Account>;
//special service for near deposit, to create a new account
@Injectable()
export class NearAccountsService implements OnModuleInit {
    private readonly logger = new Logger(NearAccountsService.name)
    private accounts: NearAccounts

    //we'll take the deposit account
    constructor() {}

    private async createClient(network: Network): Promise<Account> {
        const { privateKey, accountId } = envConfig().chainCredentials[SupportedChainKey.Near].creator[network]
        const keyPair = nearKeyPair(privateKey)
        const keyStore = nearKeyStore({
            network,
            keyPair,
            accountId,
        })

        const client = await nearClient(network, keyStore)
        this.logger.debug(`Connected to ${network} near deposit account: ${accountId}`)
        return await client.account(accountId)
    }

    async onModuleInit() {
        //delay until chain credentials loaded
        try {
            const [testnetAccount, mainnetAccount] = await Promise.all([
                this.createClient(Network.Testnet),
                this.createClient(Network.Mainnet),
            ])
            this.accounts = {
                [Network.Testnet]: testnetAccount,
                [Network.Mainnet]: mainnetAccount,
            }
        } catch (ex) {
            this.logger.error(ex)
        }
    }

    public async createAccount({
        network,
        publicKey,
        subdomain,
    }: CreateAccountParams): Promise<CreateAccountResult> {
        try {
            const account = this.accounts[network]
            const {
                transaction_outcome: { id },
            } = await account.createAccount(
                `${subdomain}.${account.accountId}`,
                publicKey,
                BigInt(0),
            )
            return {
                transactionHash: id,
            }
        } catch (ex) {
            this.logger.error(ex)
            //maybe error from username exists
            console.log(ex)
            //test for username exists
            throw new NearUsernameExistsException(subdomain)
        }
        
    }
}

export interface CreateAccountParams {
  network: Network;
  //account id
  publicKey: string;
  //username
  subdomain: string;
}

export interface CreateAccountResult {
  //transaction hash
  transactionHash: string;
}
