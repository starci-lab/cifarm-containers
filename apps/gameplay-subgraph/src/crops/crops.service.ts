import { Injectable, Logger } from "@nestjs/common"
import { CropSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"  // Import Connection for MongoDB

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection  // Replace DataSource with Connection
    ) {}

    async getCrops(): Promise<Array<CropSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<CropSchema>(CropSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }

    async getCrop(id: string): Promise<CropSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<CropSchema>(CropSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getCropByKey(key: string): Promise<CropSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<CropSchema>(CropSchema.name).findOne({ key })
        } finally {
            await mongoSession.endSession()
        }
    }
}
