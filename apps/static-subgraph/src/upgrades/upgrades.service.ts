import { GetUpgradesArgs } from "@apps/static-subgraph/src/upgrades/upgrades.dto"
import { Injectable, Logger } from "@nestjs/common"
import { UpgradeEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class UpgradeService {
    private readonly logger = new Logger(UpgradeService.name)

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getUpgrades({ limit = 10, offset = 0 }: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`GetUpgrades: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const upgrades = await this.dataSource.getRepository(UpgradeEntity).find({
                take: limit,
                skip: offset,
                relations: ["building"]
            })
            return upgrades
        } finally {
            await queryRunner.release()
        }
    }

}
