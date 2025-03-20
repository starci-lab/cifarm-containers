import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, PetId, PetSchema } from "@src/databases"
import { Connection } from "mongoose"  // Import Connection for MongoDB

@Injectable()
export class PetsService {
    private readonly logger = new Logger(PetsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection  // Replace DataSource with Connection
    ) {}

    async pets(): Promise<Array<PetSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<PetSchema>(PetSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async pet(id: PetId): Promise<PetSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<PetSchema>(PetSchema.name).findById(createObjectId(id)).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
