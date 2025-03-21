import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { CropId, CropSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"  // Import Connection for MongoDB

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection  // Replace DataSource with Connection
    ) {}

    async crops(): Promise<Array<CropSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<CropSchema>(CropSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async crop(id: CropId): Promise<CropSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<CropSchema>(CropSchema.name).findById(createObjectId(id)).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
