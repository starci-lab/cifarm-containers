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
                maxOwnership: 1
            },
            {
                _id: createObjectId(BuildingId.Coop),
                displayId: BuildingId.Coop,
                availableInShop: true,
                animalContainedType: AnimalType.Poultry,
                maxUpgrade: 3,
                price: 2000,
                unlockLevel: 5,
                upgradable: true,
                maxOwnership: 3,
                upgrades: [
                    {
                        capacity: 3,
                        upgradeLevel: 1,
                        sellPrice: 1000
                    },
                    {
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 2,
                        sellPrice: 1500
                    },
                    {
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 3,
                        sellPrice: 2000
                    }
                ]
            },
            {
                _id: createObjectId(BuildingId.Barn),
                displayId: BuildingId.Barn,
                availableInShop: true,
                animalContainedType: AnimalType.Livestock,
                maxUpgrade: 3,
                price: 2000,
                unlockLevel: 10,
                upgradable: true,
                maxOwnership: 3,
                upgrades: [
                    {
                        capacity: 3,
                        upgradeLevel: 1,
                        sellPrice: 1000
                    },
                    {
                        upgradePrice: 1000,
                        capacity: 5,
                        upgradeLevel: 2,
                        sellPrice: 1500
                    },
                    {
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 3,
                        sellPrice: 2000
                    }
                ],
            },
            {
                _id: createObjectId(BuildingId.BeeHouse),
                displayId: BuildingId.BeeHouse,
                availableInShop: true,
                maxUpgrade: 3,
                price: 2000,
                unlockLevel: 10,
                upgradable: false,
                maxOwnership: 3,
                upgrades: [
                    {
                        capacity: 3,
                        sellPrice: 1000,
                        yieldCoefficient: 1,
                    },
                    {
                        upgradePrice: 1000,
                        sellPrice: 1500,
                        yieldCoefficient: 1.25
                    },
                    {
                        upgradePrice: 2000,
                        capacity: 10,
                        upgradeLevel: 3,
                        sellPrice: 2000,
                        yieldCoefficient: 1.5
                    }
                ],
            },
            {
                _id: createObjectId(BuildingId.PetHouse),
                displayId: BuildingId.PetHouse,
                availableInShop: true,
                price: 2000,
                unlockLevel: 10,
                upgradable: false,
                maxOwnership: 1,
            },
        ]
        
        await this.connection.model<BuildingSchema>(BuildingSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping buildings...")
        await this.connection.model<BuildingSchema>(BuildingSchema.name).deleteMany({})
    }
}