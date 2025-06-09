import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { SeasonSchema, SeasonId, BulkPaid, BulkPaids, InjectMongoose, KeyValueRecord, KeyValueStoreId, KeyValueStoreSchema, UserSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { Connection } from "mongoose"

@Injectable()
export class SeasonsService {
    private readonly logger = new Logger(SeasonsService.name)

    constructor(
        private readonly staticService: StaticService,
        @InjectMongoose()
        private readonly connection: Connection 
    ) { }

    seasons(): Array<SeasonSchema> {
        return this.staticService.seasons
    }

    season(id: SeasonId): SeasonSchema {
        return this.staticService.seasons.find((season) => season.displayId === id)
    }

    activeSeason(): SeasonSchema {
        return this.staticService.seasons.find((season) => season.active)
    }

    async bulkPaids({ id: userId }: UserLike): Promise<Array<BulkPaid>> {
        const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
        if (!user) {
            throw new GraphQLError("User not found", {
                extensions: {
                    code: "USER_NOT_FOUND"
                }
            })
        }
        const bulkPaids = await this.connection.model<KeyValueStoreSchema>(
            KeyValueStoreSchema.name).findById<KeyValueRecord<BulkPaids>>(
                createObjectId(KeyValueStoreId.BulkPaids)
            )
        if (!bulkPaids) {
            throw new GraphQLError("Bulk paids not found", {
                extensions: {
                    code: "BULK_PAIDS_NOT_FOUND"
                }
            })
        }
        return Object.entries(bulkPaids.value || {}).map(([bulkId, bulkPaid]) => {
            return {
                bulkId,
                ...bulkPaid[user.network]
            }
        })
    }
}
