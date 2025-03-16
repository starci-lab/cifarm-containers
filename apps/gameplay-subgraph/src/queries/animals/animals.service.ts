import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { AnimalId, AnimalSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
    ) {}

    async getAnimals(): Promise<Array<AnimalSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(AnimalSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getAnimal(id: AnimalId) {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(AnimalSchema.name).findById(createObjectId(id)).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
