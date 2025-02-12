import { Logger } from "@nestjs/common"
import {
    Activities,
    AnimalRandomness,
    AppearanceChance,
    CropId,
    CropRandomness,
    EnergyRegen,
    SpinInfo,
    Starter,
    SystemEntity,
    SystemId,
} from "@src/databases"
import { DataSource, DeepPartial } from "typeorm"
import { Seeder } from "typeorm-extension"

export class SystemSeeder implements Seeder {
    private readonly logger = new Logger(SystemSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
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
            defaultCropId: CropId.Carrot,
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

        const data: Array<DeepPartial<SystemEntity>> = [
            {
                id: SystemId.Activities,
                value: activities
            },
            {
                id: SystemId.CropRandomness,
                value: cropRandomness
            },
            {
                id: SystemId.AnimalRandomness,
                value: animalRandomness
            },
            {
                id: SystemId.Starter,
                value: starter
            },
            {
                id: SystemId.SpinInfo,
                value: spinInfo
            },
            {
                id: SystemId.EnergyRegen,
                value: energyRegen
            }
        ]
    
        await dataSource.manager.save(SystemEntity, data)
        this.logger.verbose("System seeded successfully.")
    }
}
