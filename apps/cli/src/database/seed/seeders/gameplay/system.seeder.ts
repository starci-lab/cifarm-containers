import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    Activities,
    AnimalRandomness,
    AppearanceChance,
    CropId,
    CropRandomness,
    DailyRewardInfo,
    DailyRewardId,
    EnergyRegen,
    InjectMongoose,
    SpinInfo,
    DefaultInfo,
    SystemId,
    SystemSchema,
    HoneycombInfo,
    PlacedItemInfo,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class SystemSeeder implements Seeder {
    private readonly logger = new Logger(SystemSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async drop(): Promise<void> {
        this.logger.debug("Dropping system...")
        await this.connection.model<SystemSchema>(SystemSchema.name).deleteMany({})
    }
    
    public async seed(): Promise<void> {
        this.logger.debug("Seeding system...")
        const activities: Activities = {
            plantSeed: {
                energyConsume: 1,
                experiencesGain: 3
            },
            cureAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            feedAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpCureAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUseHerbicide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpUsePesticide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            helpWater: {
                energyConsume: 1,
                experiencesGain: 3
            },
            thiefAnimalProduct: {
                energyConsume: 1,
                experiencesGain: 3
            },
            thiefCrop: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useFertilizer: {
                energyConsume: 1,
                experiencesGain: 3
            },
            useHerbicide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            usePesticide: {
                energyConsume: 1,
                experiencesGain: 3
            },
            waterCrop: {
                energyConsume: 1,
                experiencesGain: 3
            },
            harvestCrop: {
                energyConsume: 1,
                experiencesGain: 3
            }
        }
        const cropRandomness: CropRandomness = {
            needWater: 0.5,
            thief2: 0.8,
            thief3: 0.95,
            isWeedyOrInfested: 1
        }
        const animalRandomness: AnimalRandomness = {
            sickChance: 0.5,
            thief2: 0.8,
            thief3: 0.95
        }
        const defaultInfo: DefaultInfo = {
            golds: 1000, 
            followeeLimit: 150,
            positions: {
                home: {
                    x: 4,
                    y: 0
                },
                tiles: [
                    {
                        x: 0,
                        y: -1
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 1
                    },
                    {
                        x: 1,
                        y: -1
                    },
                    {
                        x: 1,
                        y: 0
                    },
                    {
                        x: 1,
                        y: 1
                    }
                ]
            },
            defaultCropId: CropId.Turnip,
            defaultSeedQuantity: 10,
            storageCapacity: 150,
            deliveryCapacity: 9,
            toolCapacity: 8,
            referredLimit: 25,
            referralRewardQuantity: 50,
            referredRewardQuantity: 10,
            followXRewardQuantity: 20
        }
        const spinInfo: SpinInfo = {
            appearanceChanceSlots: {
                [AppearanceChance.Common]: {
                    count: 4,
                    thresholdMin: 0,
                    thresholdMax: 0.8
                },
                [AppearanceChance.Uncommon]: {
                    count: 2,
                    thresholdMin: 0.8,
                    thresholdMax: 0.95
                },
                [AppearanceChance.Rare]: {
                    count: 1,
                    thresholdMin: 0.95,
                    thresholdMax: 0.99
                },
                [AppearanceChance.VeryRare]: {
                    count: 1,
                    thresholdMin: 0.99,
                    thresholdMax: 1
                }
            }
        }
        const energyRegen: EnergyRegen = {
            // 5 minutes
            time: 60 * 5
        }
        const dailyRewardInfo: DailyRewardInfo = {
            [DailyRewardId.Day1]: {
                golds: 100,
                tokens: 0,
                day: 1,
                lastDay: false
            },
            [DailyRewardId.Day2]: {
                golds: 200,
                tokens: 0,
                day: 2,
                lastDay: false
            },
            [DailyRewardId.Day3]: {
                golds: 300,
                tokens: 0,
                day: 3,
                lastDay: false
            },
            [DailyRewardId.Day4]: {
                golds: 600,
                tokens: 0,
                day: 4,
                lastDay: false
            },
            [DailyRewardId.Day5]: {
                day: 5,
                lastDay: true,
                golds: 1000,
                tokens: 1
            },
        }
        const honeycombInfo: HoneycombInfo = {
            dailyRewardAmount: 10000000, // 10 $CARROT
            tokenResourceAddress: "6JkqdDyrXsySvnvKBmFVpay9L413VXJcd78kFJ2XSABH",
            projectAddress: "BoRbyNqh3YmYzzuFMLZ2kjFEC1whr4zS9wPskqp7uqZL",
            decimals: 6
        }
        const placedItemInfo : PlacedItemInfo = {
            tileLimit: 60,
            fruitLimit: 10,
            buildingLimit: 30
        }
        const data: Array<Partial<SystemSchema>> = [
            {
                _id: createObjectId(SystemId.Activities),
                displayId: SystemId.Activities,
                value: activities
            },
            {
                _id: createObjectId(SystemId.CropRandomness),
                displayId: SystemId.CropRandomness,
                value: cropRandomness
            },
            {
                _id: createObjectId(SystemId.AnimalRandomness),
                displayId: SystemId.AnimalRandomness,
                value: animalRandomness
            },
            {
                _id: createObjectId(SystemId.DefaultInfo),
                displayId: SystemId.DefaultInfo,
                value: defaultInfo
            },
            {
                _id: createObjectId(SystemId.SpinInfo),
                displayId: SystemId.SpinInfo,
                value: spinInfo
            },
            {
                _id: createObjectId(SystemId.EnergyRegen),
                displayId: SystemId.EnergyRegen,
                value: energyRegen
            },
            {
                _id: createObjectId(SystemId.DailyRewardInfo),
                displayId: SystemId.DailyRewardInfo,
                value: dailyRewardInfo
            },
            {
                _id: createObjectId(SystemId.HoneycombInfo),
                displayId: SystemId.HoneycombInfo,
                value: honeycombInfo
            },
            {
                _id: createObjectId(SystemId.PlacedItemInfo),
                displayId: SystemId.PlacedItemInfo,
                value: placedItemInfo
            }
        ]
        await this.connection.model<SystemSchema>(SystemSchema.name).insertMany(data)
    }
}
