import { Injectable, Logger } from "@nestjs/common"
import { VaultCurrentResponse, VaultCurrentRequest } from "./vault.dto"
import { Connection } from "mongoose"
import { InjectMongoose, KeyValueRecord, KeyValueStoreId, KeyValueStoreSchema, VaultInfos } from "@src/databases"
import { createObjectId } from "@src/common"
import { VaultService } from "@src/gameplay"

// use different service name to ensure DI is working
@Injectable()
export class GraphQLVaultService {
    private readonly logger = new Logger(GraphQLVaultService.name)

    constructor(
        private readonly vaultService: VaultService,
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async vaultCurrent({ network, chainKey }: VaultCurrentRequest): Promise<VaultCurrentResponse> {
        const { value: vaultInfos } = await this.connection
            .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
            .findById<KeyValueRecord<VaultInfos>>(createObjectId(KeyValueStoreId.VaultInfos))

        const paidAmount = await this.vaultService.computePaidAmount({
            network,
            chainKey,
            vaultInfoData: vaultInfos[chainKey][network]
        })

        return {
            paidAmount,
            paidCount: vaultInfos[chainKey][network].paidCount || 0,
            tokenLocked: vaultInfos[chainKey][network].tokenLocked || 0
        }
    }
}
