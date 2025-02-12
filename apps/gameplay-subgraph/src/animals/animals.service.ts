import { Injectable, Logger } from "@nestjs/common"
import { AnimalSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
    ) {}

    async getAnimals(): Promise<Array<AnimalSchema>> {
        return await this.connection.model(AnimalSchema.name).find()
    }

    async getAnimal(id: string) {
        return await this.connection.model(AnimalSchema.name).findById(id)  
    }

    async getAnimalByKey(key: string) {
        return await this.connection.model(AnimalSchema.name).findOne({ key })
    }
}
