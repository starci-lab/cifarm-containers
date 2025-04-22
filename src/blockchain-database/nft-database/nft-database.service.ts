import { Injectable } from "@nestjs/common"
import { InjectMongoose, NFTIndexSchema } from "@src/databases"
import { ChainKey } from "@src/env"
import { Network } from "@src/env"
import { ClientSession, Connection } from "mongoose"

@Injectable()
export class NFTDatabaseService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getNextNFTIndex({
        network,
        chainKey,
        collectionAddress,
        session,
        save = true
    }: GetNextNFTIndexParams): Promise<number> {
        const nftIndex = await this.connection
            .model<NFTIndexSchema>(NFTIndexSchema.name)
            .findOne({ network, chainKey, collectionAddress })
            .session(session)
        if (!nftIndex) {
            await this.connection
                .model<NFTIndexSchema>(NFTIndexSchema.name)
                .create([{ network, chainKey, collectionAddress, index: 0 }], { session })
            return 0
        }
        // increment the index
        nftIndex.index += 1
        if (save) {
            await nftIndex.save({ session })
        }
        return nftIndex.index
    }
}

export interface GetNextNFTIndexParams {
    network: Network
    chainKey: ChainKey
    collectionAddress: string
    session: ClientSession
    save: boolean
}
