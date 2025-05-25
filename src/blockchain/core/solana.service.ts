import { Injectable } from "@nestjs/common"
import { Connection, Keypair, sendAndConfirmTransaction, Transaction } from "@solana/web3.js"
import { ChainKey, Network } from "@src/env"
import { decode } from "bs58"
import { solanaHttpRpcUrl } from "../rpcs"
import { CipherService } from "@src/crypto"

@Injectable()
export class SolanaCoreService {
    private connections: Record<Network, Connection>
    constructor(
        private readonly cipherService: CipherService
    ) {
        this.connections = {
            [Network.Mainnet]: new Connection(solanaHttpRpcUrl(ChainKey.Solana, Network.Mainnet)),
            [Network.Testnet]: new Connection(solanaHttpRpcUrl(ChainKey.Solana, Network.Testnet))
        }
    }

    public getConnection(network: Network = Network.Testnet) {
        return this.connections[network]
    }

    // get public key from private key
    public getKeypair(encryptedPrivateKey: string) {
        const privateKey = this.cipherService.decrypt(encryptedPrivateKey)
        return Keypair.fromSecretKey(decode(privateKey))
    }

    // sign and send transaction
    public async signAndSendTransaction<T extends Transaction>({ privateKey, transaction, network = Network.Testnet }: SignAndSendTransactionParams<T>) {
        const connection = this.connections[network]
        // sign and send transaction
        const keypair = Keypair.fromSecretKey(decode(privateKey))
        const txHash = await sendAndConfirmTransaction(connection, transaction, [keypair])
        return txHash
    }
}

export interface SignAndSendTransactionParams<T> {
    privateKey: string
    transaction: T
    network?: Network
}

