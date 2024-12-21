import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetUpgradesArgs } from "./"
import { UpgradeEntity } from "@src/database"

@Injectable()
export class UpgradeService {
    private readonly logger = new Logger(UpgradeService.name)

    private readonly relations = {
        building: true,
    }

    constructor(private readonly dataSource: DataSource) {}

    async getUpgrades({ limit = 10, offset = 0 }: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`GetUpgrades: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const upgrades = await queryRunner.manager.find(UpgradeEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return upgrades
        } finally {
            await queryRunner.release()
        }
    }

    async getUpgradeById(id: string): Promise<UpgradeEntity | null> {
        this.logger.debug(`GetUpgradeById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const upgrade = await queryRunner.manager.findOne(UpgradeEntity, {
                where: { id },
                relations: this.relations
            })
            return upgrade
        } finally {
            await queryRunner.release()
        }
    }
}
    
