import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import {
    Activities,
    AnimalRandomness,
    PostgreSQLCacheQueryRunnerService,
    CropRandomness,
    EnergyRegenTime,
    InjectPostgreSQL,
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
        private readonly postgreSQLCacheQueryRunnerService: PostgreSQLCacheQueryRunnerService
    ) {}

    async getActivities(): Promise<Activities> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: activities } = await this.postgreSQLCacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.Activities
                    }
                }
            )
            return activities as Activities
        } finally {
            await queryRunner.release()
        }
    }

    async getCropRandomness(): Promise<CropRandomness> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: cropRandomness } = await this.postgreSQLCacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.CropRandomness
                    }
                }
            )
            return cropRandomness as CropRandomness
        } finally {
            await queryRunner.release()
        }
    }

    async getAnimalRandomness(): Promise<AnimalRandomness> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: animalRandomness } =
                await this.postgreSQLCacheQueryRunnerService.findOne(queryRunner, SystemEntity, {
                    where: {
                        id: SystemId.AnimalRandomness
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
            const { value: starter } = await this.postgreSQLCacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.Starter
                    }
                }
            )
            return starter as Starter
        } finally {
            await queryRunner.release()
        }
    }

    async getSpinInfo(): Promise<SpinInfo> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: spinInfo } = await this.postgreSQLCacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.SpinInfo
                    }
                }
            )
            return spinInfo as SpinInfo
        } finally {
            await queryRunner.release()
        }
    }

    async getEnergyRegenTime(): Promise<EnergyRegenTime> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: energyRegenTime } = await this.postgreSQLCacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.EnergyRegenTime
                    }
                }
            )
            return energyRegenTime as EnergyRegenTime
        } finally {
            await queryRunner.release()
        }
    }
}
