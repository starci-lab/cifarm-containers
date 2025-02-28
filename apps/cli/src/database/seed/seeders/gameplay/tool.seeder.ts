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
                sort: 0,
            },
            {
                _id: createObjectId(ToolId.WateringCan),
                displayId: ToolId.WateringCan,
                sort: 1,
            },
            {
                _id: createObjectId(ToolId.Pesticide),
                displayId: ToolId.Pesticide,
                sort: 2,
            },
            {
                _id: createObjectId(ToolId.Herbicide),
                displayId: ToolId.Herbicide,
                sort: 3,
            }
        ]

        await this.connection.model<ToolSchema>(ToolSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping tools...")
        await this.connection.model<ToolSchema>(ToolSchema.name).deleteMany({})
    }
}
