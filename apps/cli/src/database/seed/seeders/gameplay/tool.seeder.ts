import { Injectable, Logger } from "@nestjs/common"
import {
    AvailableInType,
    InjectMongoose,
    ToolSchema,
    ToolKey
} from "@src/databases"
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
            { key: ToolKey.Hand, availableIn: AvailableInType.Both, index: 0 },
            { key: ToolKey.Scythe, availableIn: AvailableInType.Home, index: 1 },
            { key: ToolKey.ThiefHand, availableIn: AvailableInType.Neighbor, index: 2 },
            { key: ToolKey.WaterCan, availableIn: AvailableInType.Both, index: 3 },
            { key: ToolKey.Herbicide, availableIn: AvailableInType.Both, index: 4 },
            { key: ToolKey.Pesticide, availableIn: AvailableInType.Both, index: 5 }
        ]

        await this.connection.model<ToolSchema>(ToolSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping tools...")
        await this.connection.model<ToolSchema>(ToolSchema.name).deleteMany({})
    }
}
