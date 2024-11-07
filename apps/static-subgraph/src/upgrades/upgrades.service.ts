import { Injectable, Logger } from "@nestjs/common"
import { UpgradeEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetUpgradesArgs } from "./upgrades.dto"

@Injectable()
export class UpgradesService {
    private readonly logger = new Logger(UpgradesService.name)

    constructor(private readonly dataSource: DataSource) {}
    
    async getUpgrades({
        limit = 10,
        offset = 0,
    }: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`GetUpgrades: limit=${limit}, offset=${offset}`)
        return this.dataSource.manager.find(UpgradeEntity, {
            take: limit,
            skip: offset,
        })
    }
}
