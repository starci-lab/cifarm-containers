import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { BuildingId, BuildingSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async buildings(): Promise<Array<BuildingSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<BuildingSchema>(BuildingSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async building(id: BuildingId): Promise<BuildingSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<BuildingSchema>(BuildingSchema.name).findById(createObjectId(id)).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
