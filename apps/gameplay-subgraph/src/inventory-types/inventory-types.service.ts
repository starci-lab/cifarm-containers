import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, InventoryTypeSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class InventoryTypesService {
    private readonly logger = new Logger(InventoryTypesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getInventoryTypes(): Promise<Array<InventoryTypeSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(InventoryTypeSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getInventoryType(id: string): Promise<InventoryTypeSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(InventoryTypeSchema.name).findById(id).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getInventoryTypeByKey(key: string): Promise<InventoryTypeSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(InventoryTypeSchema.name).findOne({ key }).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
