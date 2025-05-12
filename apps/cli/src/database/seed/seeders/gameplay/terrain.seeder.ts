
import {
    InjectMongoose,
    TerrainSchema,
    TerrainId,
    TerrainType
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

@Injectable()
export class TerrainSeeder implements Seeder {
    private readonly logger = new Logger(TerrainSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding terrains...")
        const data: Array<Partial<TerrainSchema>> = [
            {
                _id: createObjectId(TerrainId.SmallGrassPatch),
                displayId: TerrainId.SmallGrassPatch,
                type: TerrainType.GrassPatch,
                sellable: false,
                availableInShop: true,
            },
            {
                _id: createObjectId(TerrainId.SmallStone),
                displayId: TerrainId.SmallStone,
                type: TerrainType.Stone,
                sellable: false,
                availableInShop: true,
            },
            {
                _id: createObjectId(TerrainId.OakTree),
                displayId: TerrainId.OakTree,
                type: TerrainType.OakTree,
                sellable: false,
                availableInShop: true,
            },
            {
                _id: createObjectId(TerrainId.PineTree),
                displayId: TerrainId.PineTree,
                type: TerrainType.PineTree,
                sellable: true,
                availableInShop: true,
            },
            {
                _id: createObjectId(TerrainId.MapleTree),
                displayId: TerrainId.MapleTree,
                type: TerrainType.MapleTree,
                sellable: true,
                availableInShop: true,
            }
        ]
        try {
            await this.connection.model<TerrainSchema>(TerrainSchema.name).insertMany(data)
        } catch (error) {
            console.error(error)
        }
    }

        
    async drop(): Promise<void> {
        this.logger.verbose("Dropping terrains...")
        await this.connection.model<TerrainSchema>(TerrainSchema.name).deleteMany({})
    }
}
