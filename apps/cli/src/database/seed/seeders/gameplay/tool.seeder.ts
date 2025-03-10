import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, ToolSchema, ToolId } from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class ToolSeeder implements Seeder {
    private readonly logger = new Logger(ToolSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding tools...")

        const data: Array<Partial<ToolSchema>> = [
            {
                _id: createObjectId(ToolId.Hand),
                displayId: ToolId.Hand,
                default: true,
                sort: 0,
            },
            {
                _id: createObjectId(ToolId.Crate),
                displayId: ToolId.Crate,
                givenAsDefault: true,
                sort: 0,
            },
            {
                _id: createObjectId(ToolId.WateringCan),
                displayId: ToolId.WateringCan,
                givenAsDefault: true,
                sort: 1,
            },
            {
                _id: createObjectId(ToolId.Pesticide),
                displayId: ToolId.Pesticide,
                givenAsDefault: true,
                sort: 2,
            },
            {
                _id: createObjectId(ToolId.Herbicide),
                displayId: ToolId.Herbicide,
                givenAsDefault: true,
                sort: 3,
            },
            {
                _id: createObjectId(ToolId.Hammer),
                displayId: ToolId.Hammer,
                availableInShop: true,
                price: 200,
            },
            {
                _id: createObjectId(ToolId.AnimalMedicine),
                displayId: ToolId.AnimalMedicine,
                availableInShop: true,
                price: 200,
                unlockLevel: 5,
            },
        ]

        await this.connection.model<ToolSchema>(ToolSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping tools...")
        await this.connection.model<ToolSchema>(ToolSchema.name).deleteMany({})
    }
}
