import { Injectable } from "@nestjs/common"
import { Network } from "@src/env"
import { S3Service } from "@src/s3"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { CreateSuiMintNFTTransactionResponse, CreateSuiMintNFTTransactionParams } from "./types"
import { v4 } from "uuid"

@Injectable()
export class SuiService {
    private clients: Record<Network, SuiClient>
    constructor(private readonly s3Service: S3Service) {
        // Constructor logic here
        this.clients = {
            [Network.Mainnet]: new SuiClient({ url: getFullnodeUrl("testnet") }),
            [Network.Testnet]: new SuiClient({ url: getFullnodeUrl("mainnet") })
        }
    }

    public async createMintNFTTransaction({
        nftTreasuryCapId,
        name,
        attributes,
        metadata,
        ownerAddress,
        collectionAddress,
        transaction
    }: CreateSuiMintNFTTransactionParams): Promise<CreateSuiMintNFTTransactionResponse> {
        const uri = await this.s3Service.uploadJson(v4(), metadata)
        transaction.moveCall({
            target: `${collectionAddress}::mint_nft`,
            arguments: [
                transaction.pure.string(nftTreasuryCapId),
                transaction.pure.string(name),
                transaction.pure.string(uri),
                transaction.pure.vector(
                    "string",
                    attributes.map((attribute) => attribute.key.toString())
                ),
                transaction.pure.vector(
                    "string",
                    attributes.map((attribute) => attribute.value.toString())
                ),
                transaction.pure.address(ownerAddress),
            ],
        })
        // let payment: Array<SuiObjectRef> = []
        // let retires = 50
        // while (retires !== 0) {
        //     const coins = await client.getCoins({ owner: feePayer, limit: 1 })
        //     if (coins.data.length > 0) {
        //         payment = coins.data.map((coin) => ({
        //             objectId: coin.coinObjectId,
        //             version: coin.version,
        //             digest: coin.digest,
        //         }))
        //         break
        //     }
        //     await new Promise((resolve) => setTimeout(resolve, 200)) // Sleep for 200ms
        //     retires -= 1
        // }
        return {
            transaction,
        }
    }
}
