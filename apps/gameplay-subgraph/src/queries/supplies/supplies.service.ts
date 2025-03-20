import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, SupplyId, SupplySchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async supply(id: SupplyId): Promise<SupplySchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<SupplySchema>(SupplySchema.name).findById(createObjectId(id))
        } finally {
            await mongoSession.endSession()
        }
    }

    async supplies(): Promise<Array<SupplySchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<SupplySchema>(SupplySchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }
}
