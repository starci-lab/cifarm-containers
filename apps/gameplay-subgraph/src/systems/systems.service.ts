import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import {
    Activities,
    AnimalRandomness,
    CropRandomness,
    EnergyRegenTime,
    InjectPostgreSQL,
    PostgreSQLCacheKeyService,
    PostgreSQLCacheKeyType,
    SpinInfo,
    Starter,
    SystemEntity,
    SystemId
} from "@src/databases"
// import { ACTIVITIES_CACHE_NAME } from "./system.constants"
// import { envConfig } from "@src/env"

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private postgreSqlCacheKeyService: PostgreSQLCacheKeyService
    ) {}

    async getActivities(): Promise<Activities> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: activities } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.Activities
                },
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: SystemEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id: SystemId.Activities
                        }
                    }),
                    // use default instead of hardcoding the value
                    milliseconds: 0
                }
            })
            return activities as Activities
        } finally {
            await queryRunner.release()
        }
    }

    async getCropRandomness(): Promise<CropRandomness> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: cropRandomness } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.CropRandomness
                },
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: SystemEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id: SystemId.CropRandomness
                        }
                    }),
                    // use default instead of hardcoding the value
                    milliseconds: 0
                }
            })
            return cropRandomness as CropRandomness
        } finally {
            await queryRunner.release()
        }
    }

    async getAnimalRandomness(): Promise<AnimalRandomness> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: animalRandomness } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.AnimalRandomness
                },
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: SystemEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id: SystemId.AnimalRandomness
                        }
                    }),
                    // use default instead of hardcoding the value
                    milliseconds: 0
                }
            })
            return animalRandomness as AnimalRandomness
        } finally {
            await queryRunner.release()
        }
    }

    async getStarter(): Promise<Starter> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: starter } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.Starter
                },
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: SystemEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id: SystemId.Starter
                        }
                    }),
                    // use default instead of hardcoding the value
                    milliseconds: 0
                }
            })
            return starter as Starter
        } finally {
            await queryRunner.release()
        }
    }

    async getSpinInfo(): Promise<SpinInfo> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: spinInfo } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.SpinInfo
                },
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: SystemEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id: SystemId.SpinInfo
                        }
                    }),
                    // use default instead of hardcoding the value
                    milliseconds: 0
                }
            })
            return spinInfo as SpinInfo
        } finally {
            await queryRunner.release()
        }
    }

    async getEnergyRegenTime(): Promise<EnergyRegenTime> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: energyRegenTime } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.EnergyRegenTime
                },
                cache: {
                    id: this.postgreSqlCacheKeyService.generateCacheKey({
                        entity: SystemEntity,
                        identifier: {
                            type: PostgreSQLCacheKeyType.Id,
                            id: SystemId.EnergyRegenTime
                        }
                    }),
                    // use default instead of hardcoding the value
                    milliseconds: 0
                }
            })
            return energyRegenTime as EnergyRegenTime
        } finally {
            await queryRunner.release()
        }
    }
}
