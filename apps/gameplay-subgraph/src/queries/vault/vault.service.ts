import { Injectable, Logger } from "@nestjs/common"
import { VaultCurrentResponse, VaultCurrentRequest } from "./vault.dto"
import { Connection } from "mongoose"
import { InjectMongoose, KeyValueRecord, KeyValueStoreId, KeyValueStoreSchema, VaultInfos } from "@src/databases"
import { createObjectId } from "@src/common"
import { SolanaService } from "@src/blockchain"
// use different service name to ensure DI is working
@Injectable()
export class GraphQLVaultService {
    private readonly logger = new Logger(GraphQLVaultService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService
    ) {}

    async vaultCurrent({ network }: VaultCurrentRequest): Promise<VaultCurrentResponse> {
        const { value: vaultInfos } = await this.connection
            .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
            .findById<KeyValueRecord<VaultInfos>>(createObjectId(KeyValueStoreId.VaultInfos))
        const vaultAddress = this.solanaService.getVaultUmi(network).identity.publicKey.toString()
        return {
            data: vaultInfos[network].data,
            vaultAddress
        }
    }
}
