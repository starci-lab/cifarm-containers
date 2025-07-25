import { Injectable, Logger } from "@nestjs/common"
import { GetVaultCurrentRequest, GetVaultCurrentResponse } from "./vault.dto"
import { Connection } from "mongoose"
import { InjectMongoose, KeyValueRecord, KeyValueStoreId, KeyValueStoreSchema, VaultInfos } from "@src/databases"
import { SolanaService } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { createObjectId } from "@src/common"
// use different service name to ensure DI is working
@Injectable()
export class GraphQLVaultService {
    private readonly logger = new Logger(GraphQLVaultService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService
    ) {}

    async vaultCurrent({ network }: GetVaultCurrentRequest): Promise<GetVaultCurrentResponse> {
        const vaultAddress = this.solanaService.getVaultUmi(network).identity.publicKey.toString()
        const vaultInfos = await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).findById<KeyValueRecord<VaultInfos>>(createObjectId(KeyValueStoreId.VaultInfos))
        if (!vaultInfos) {
            throw new GraphQLError("Vault infos not found", {
                extensions: {
                    code: "VAULT_INFOS_NOT_FOUND"
                }
            })
        }
        return {
            data: vaultInfos.value[network].data,
            vaultAddress
        }
    }
}
