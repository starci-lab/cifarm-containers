import {
    AnimalType,
    BuildingId,
    BuildingSchema,
    BuildingKind,
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
        try {
            this.logger.debug("Seeding buildings...")
            const data: Array<DeepPartial<BuildingSchema>> = [
                {
                    _id: createObjectId(BuildingId.Home),
                    displayId: BuildingId.Home,
                    availableInShop: false,
                    maxUpgrade: 0,
                    price: 0,
                    upgradeable: false,
                    unlockLevel: 0, 
                    maxOwnership: 1,
                    kind: BuildingKind.Neutral
                },
                {
                    _id: createObjectId(BuildingId.Coop),
                    displayId: BuildingId.Coop,
                    availableInShop: true,
                    animalContainedType: AnimalType.Poultry,
                    maxUpgrade: 3,
                    price: 2000,
                    unlockLevel: 5,
                    upgradeable: true,
                    maxOwnership: 3,
                    kind: BuildingKind.AnimalHouse,
                    sellable: true,
                    sellPrice: 1000,
                    upgrades: [
                        {
                            capacity: 2,
                            upgradeLevel: 1,
                        },
                        {
                            upgradePrice: 2000,
                            capacity: 4,
                            upgradeLevel: 2,
                        },
                        {
                            upgradePrice: 4000,
                            capacity: 6,
                            upgradeLevel: 3,
                        }
                    ]
                },
                {
                    _id: createObjectId(BuildingId.Barn),
                    displayId: BuildingId.Barn,
                    availableInShop: true,
                    animalContainedType: AnimalType.Livestock,
                    maxUpgrade: 3,
                    price: 4000,
                    unlockLevel: 10,
                    upgradeable: true,
                    maxOwnership: 3,
                    kind: BuildingKind.AnimalHouse,
                    sellable: true,
                    sellPrice: 2000,
                    upgrades: [
                        {
                            capacity: 2,
                            upgradeLevel: 1,
                        },
                        {
                            upgradePrice: 4000,
                            capacity: 4,
                            upgradeLevel: 2,
                        },
                        {
                            upgradePrice: 8000,
                            capacity: 6,
                            upgradeLevel: 3,
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
                    upgradeable: true,
                    maxOwnership: 3,
                    kind: BuildingKind.BeeHouse,
                    beeHouseYieldTime: 3600,
                    beeHouseBasicHarvestExperiences: 10,
                    beeHouseQualityHarvestExperiences: 15,
                    baseHoneyYieldCoefficient: 10,
                    sellable: true,
                    sellPrice: 1000,
                    upgrades: [
                        {
                            capacity: 3,
                            upgradeLevel: 1,
                            honeyMultiplier: 1,
                        },
                        {
                            upgradePrice: 1000,
                            upgradeLevel: 2,
                            honeyMultiplier: 1.25
                        },
                        {
                            upgradePrice: 2000,
                            capacity: 10,
                            upgradeLevel: 3,
                            honeyMultiplier: 1.5
                        }
                    ],
                },
                {
                    _id: createObjectId(BuildingId.PetHouse),
                    displayId: BuildingId.PetHouse,
                    availableInShop: true,
                    price: 2000,
                    unlockLevel: 10,
                    upgradeable: true,
                    maxOwnership: 1,
                    kind: BuildingKind.PetHouse,
                    upgrades: [
                        {   
                            //2 cats, 2 dogs
                            capacity: 3,
                            upgradeLevel: 1,
                        },
                        {
                            //4 cats, 4 dogs
                            upgradePrice: 1000,
                            capacity: 5,
                            upgradeLevel: 2,
                        },
                        {
                            //8 cats, 8 dogs
                            upgradePrice: 2000,
                            capacity: 10,
                            upgradeLevel: 3,
                        }
                    ],
                },
                {
                    _id: createObjectId(BuildingId.FishPond),
                    displayId: BuildingId.FishPond,
                    availableInShop: true,
                    maxUpgrade: 3,
                    price: 2000,
                    unlockLevel: 10,
                    upgradeable: true,
                    maxOwnership: 3,
                    kind: BuildingKind.FishPond,
                    sellable: true,
                    sellPrice: 1000,
                    upgrades: [
                        {
                            capacity: 3,
                            upgradeLevel: 1,
                        },
                        {
                            upgradePrice: 1000,
                            capacity: 5,
                            upgradeLevel: 2,
                        },
                        {
                            upgradePrice: 2000,
                            capacity: 10,
                            upgradeLevel: 3,
                        }
                    ]
                }
            ] 
            await this.connection.model<BuildingSchema>(BuildingSchema.name).insertMany(data)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }


    async drop(): Promise<void> {
        this.logger.verbose("Dropping buildings...")
        await this.connection.model<BuildingSchema>(BuildingSchema.name).deleteMany({})
    }
}