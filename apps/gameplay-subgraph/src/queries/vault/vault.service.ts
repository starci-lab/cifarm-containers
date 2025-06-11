import { Injectable, Logger } from "@nestjs/common"
import { VaultCurrentResponse } from "./vault.dto"
import { Connection } from "mongoose"
import { InjectMongoose, KeyValueRecord, KeyValueStoreId, KeyValueStoreSchema, VaultInfos } from "@src/databases"
import { SolanaService } from "@src/blockchain"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { UserSchema } from "@src/databases"
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

    async vaultCurrent({ id: userId, network }: UserLike): Promise<VaultCurrentResponse> {
        if (network === undefined) {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
            if (!user) {
                throw new GraphQLError("User not found", {
                    extensions: {
                        code: "USER_NOT_FOUND"
                    }
                })
            }
            network = user.network
        }
        
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
