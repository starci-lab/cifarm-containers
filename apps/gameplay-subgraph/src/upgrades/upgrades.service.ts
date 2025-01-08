import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetUpgradesArgs } from "./upgrades.dto"
import { InjectPostgreSQL, UpgradeEntity } from "@src/databases"

@Injectable()
export class UpgradeService {
    private readonly logger = new Logger(UpgradeService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) { }

    async getUpgrade(id: string): Promise<UpgradeEntity | null> {
        this.logger.debug(`GetUpgradeById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(UpgradeEntity, {
                where: { id },
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getUpgrades({ limit = 10, offset = 0 }: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`GetUpgrades: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const upgrades = await queryRunner.manager.find(UpgradeEntity, {
                take: limit,
                skip: offset,
            })
            return upgrades
        } finally {
            await queryRunner.release()
        }
    }
}
    
