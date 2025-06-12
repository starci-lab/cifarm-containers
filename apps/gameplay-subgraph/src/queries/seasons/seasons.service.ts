import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    SeasonSchema,
    SeasonId, 
    BulkPaid, 
    BulkPaids,
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId, 
    KeyValueStoreSchema,
} from "@src/databases"
import { StaticService } from "@src/gameplay"
import { GraphQLError } from "graphql"
import { Connection } from "mongoose"
import { GetBulkPaidsRequest } from "./seasons.dto"

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

    async bulkPaids({ network }: GetBulkPaidsRequest): Promise<Array<BulkPaid>> {
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
                ...bulkPaid[network]
            }
        })
    }
}
