import {
    InjectMongoose,
    FishSchema,
    FishId,
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { DeepPartial, createObjectId } from "@src/common"

@Injectable()
export class FishSeeder implements Seeder {
    private readonly logger = new Logger(FishSeeder.name)

    constructor(
            @InjectMongoose()
            private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        try {
            this.logger.debug("Seeding fishes...")
            const data: Array<DeepPartial<FishSchema>> = [
                {
                    _id: createObjectId(FishId.SockeyeSalmon),
                    displayId: FishId.SockeyeSalmon,
                    availableInShop: true,
                    price: 2000,
                },
                {
                    _id: createObjectId(FishId.Catfish),
                    displayId: FishId.Catfish,
                    availableInShop: true,
                    price: 2000,
                },
            ]
            await this.connection.model<FishSchema>(FishSchema.name).insertMany(data)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }


    async drop(): Promise<void> {
        this.logger.verbose("Dropping fishes...")
        await this.connection.model<FishSchema>(FishSchema.name).deleteMany({})
    }
}   