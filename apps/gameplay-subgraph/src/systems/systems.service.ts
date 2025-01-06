import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { Activities, AnimalRandomness, CropRandomness, EnergyRegenTime, GameplayPostgreSQLService, SpinInfo, Starter, SystemEntity, SystemId } from "@src/databases"

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getActivities(): Promise<Activities> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const { value : activities } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.Activities
                },
                cache: 1000000
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
            const { value : cropRandomness } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.CropRandomness
                },
                cache: 1000000
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
            const { value : animalRandomness } = await queryRunner.manager.findOne(SystemEntity, {
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
            const { value : starter } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.Starter
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
            const { value : spinInfo } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.SpinInfo
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
            const { value : energyRegenTime } = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.EnergyRegenTime
                }
            })
            return energyRegenTime as EnergyRegenTime
        } finally {
            await queryRunner.release()
        }
    }
}
