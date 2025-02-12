import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalRandomness,
    AppearanceChance,
    CropKey,
    CropRandomness,
    DailyRewardInfo,
    DailyRewardKey,
    EnergyRegen,
    InjectMongoose,
    SpinInfo,
    Starter,
    SystemKey,
    SystemSchema,
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
            cureAnimal: {
                energyConsume: 1,
                experiencesGain: 3
            },
            collectAnimalProduct: {
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
            water: {
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
        const starter: Starter = {
            golds: 1000,
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
            defaultCropKey: CropKey.Carrot,
            defaultSeedQuantity: 10
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
            [DailyRewardKey.Day1]: {
                golds: 100,
                tokens: 0,
                day: 1,
                lastDay: false
            },
            [DailyRewardKey.Day2]: {
                golds: 200,
                tokens: 0,
                day: 2,
                lastDay: false
            },
            [DailyRewardKey.Day3]: {
                golds: 300,
                tokens: 0,
                day: 3,
                lastDay: false
            },
            [DailyRewardKey.Day4]: {
                golds: 600,
                tokens: 0,
                day: 4,
                lastDay: false
            },
            [DailyRewardKey.Day5]: {
                day: 5,
                lastDay: true,
                golds: 1000,
                tokens: 1
            },
        }

        const data: Array<Partial<SystemSchema>> = [
            {
                key: SystemKey.Activities,
                value: activities
            },
            {
                key: SystemKey.CropRandomness,
                value: cropRandomness
            },
            {
                key: SystemKey.AnimalRandomness,
                value: animalRandomness
            },
            {
                key: SystemKey.Starter,
                value: starter
            },
            {
                key: SystemKey.SpinInfo,
                value: spinInfo
            },
            {
                key: SystemKey.EnergyRegen,
                value: energyRegen
            },
            {
                key: SystemKey.DailyRewardInfo,
                value: dailyRewardInfo
            }
        ]
        await this.connection.model<SystemSchema>(SystemSchema.name).insertMany(data)
    }
}
