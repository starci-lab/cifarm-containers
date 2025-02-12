import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import {
    Activities,
    AnimalRandomness,
    CacheQueryRunnerService,
    CropRandomness,
    EnergyRegen,
    InjectPostgreSQL,
    SpinInfo,
    DefaultInfo,
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
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getActivities(): Promise<Activities> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: activities } = await this.cacheQueryRunnerService.findOne(
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
            const { value: cropRandomness } = await this.cacheQueryRunnerService.findOne(
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
                await this.cacheQueryRunnerService.findOne(queryRunner, SystemEntity, {
                    where: {
                        id: SystemId.AnimalRandomness
                    }
                })
            return animalRandomness as AnimalRandomness
        } finally {
            await queryRunner.release()
        }
    }

    async getDefaultInfo(): Promise<DefaultInfo> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: starter } = await this.cacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.DefaultInfo
                    }
                }
            )
            return starter as DefaultInfo
        } finally {
            await queryRunner.release()
        }
    }

    async getSpinInfo(): Promise<SpinInfo> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: spinInfo } = await this.cacheQueryRunnerService.findOne(
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

    async getEnergyRegen(): Promise<EnergyRegen> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value: energyRegenTime } = await this.cacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.EnergyRegen
                    }
                }
            )
            return energyRegenTime as EnergyRegen
        } finally {
            await queryRunner.release()
        }
    }
}
