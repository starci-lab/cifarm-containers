import {
    AnimalType,
    BuildingId,
    BuildingSchema,
    InjectMongoose,
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { DeepPartial, createObjectId } from "@src/common"

@Injectable()
export class BuildingSeeder implements Seeder {
    private readonly logger = new Logger(BuildingSeeder.name)

    constructor(
            @InjectMongoose()
            private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding buildings...")
        const data: Array<DeepPartial<BuildingSchema>> = [
            {
                _id: createObjectId(BuildingId.Home),
                displayId: BuildingId.Home,
                availableInShop: false,
                maxUpgrade: 0,
                price: 0,
                upgradable: false,
                unlockLevel: 0, 
                upgrades: [],
                maxCount: 1
            },
            {
                _id: createObjectId(BuildingId.Coop),
                displayId: BuildingId.Coop,
                availableInShop: true,
                type: AnimalType.Poultry,
                maxUpgrade: 2,
                price: 2000,
                unlockLevel: 5,
                upgradable: false,
                maxCount: 5,
                upgrades: [
                    {
                        capacity: 3,
                        upgradeLevel: 500
                    },
                    {
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 1
                    },
                    {
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 2
                    }
                ]
            },
            {
                _id: createObjectId(BuildingId.Barn),
                displayId: BuildingId.Barn,
                availableInShop: true,
                type: AnimalType.Livestock,
                maxUpgrade: 2,
                price: 2000,
                unlockLevel: 5,
                upgradable: false,
                maxCount: 5,
                upgrades: [
                    {
                        upgradePrice: 500,
                        capacity: 3,
                        upgradeLevel: 0
                    },
                    {
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 1
                    },
                    {
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 2
                    }
                ],
            },
        ]
        
        await this.connection.model<BuildingSchema>(BuildingSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping buildings...")
        await this.connection.model<BuildingSchema>(BuildingSchema.name).deleteMany({})
    }
}