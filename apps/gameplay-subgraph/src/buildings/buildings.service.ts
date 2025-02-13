import { Injectable, Logger } from "@nestjs/common"
import { BuildingSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getBuildings(): Promise<Array<BuildingSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<BuildingSchema>(BuildingSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getBuilding(id: string): Promise<BuildingSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<BuildingSchema>(BuildingSchema.name).findById(id).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getBuildingByKey(key: string): Promise<BuildingSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<BuildingSchema>(BuildingSchema.name).findOne({ key }).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
