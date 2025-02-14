import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { AvailableInType, InjectMongoose, ToolSchema, ToolId } from "@src/databases"
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
                availableIn: AvailableInType.Both,
                index: 0
            },
            {
                _id: createObjectId(ToolId.Scythe),
                displayId: ToolId.Scythe,
                availableIn: AvailableInType.Home,
                index: 1
            },
            {
                _id: createObjectId(ToolId.ThiefHand),
                displayId: ToolId.ThiefHand,
                availableIn: AvailableInType.Neighbor,
                index: 2
            },
            {
                _id: createObjectId(ToolId.WateringCan),
                displayId: ToolId.WateringCan,
                availableIn: AvailableInType.Both,
                index: 3
            },
            {
                _id: createObjectId(ToolId.Pesticide),
                displayId: ToolId.Pesticide,
                availableIn: AvailableInType.Both,
                index: 4
            },
            {
                _id: createObjectId(ToolId.Herbicide),
                displayId: ToolId.Herbicide,
                availableIn: AvailableInType.Both,
                index: 5
            }
        ]

        await this.connection.model<ToolSchema>(ToolSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping tools...")
        await this.connection.model<ToolSchema>(ToolSchema.name).deleteMany({})
    }
}
