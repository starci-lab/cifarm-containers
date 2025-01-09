import { Inject, Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { SeederConstructor, runSeeders as typeOrmRunSeeders } from "typeorm-extension"
import { MODULE_OPTIONS_TOKEN } from "./seeders.module-definition"
import { SeederOptions } from "./seeders.types"
import { PostgreSQLDatabase } from "@src/env"
import { gameplaySeeders } from "./gameplay"
import {
    AnimalEntity,
    SpinPrizeEntity,
    CropEntity,
    UpgradeEntity,
    BuildingEntity,
    ToolEntity,
    TileEntity,
    SupplyEntity,
    DailyRewardEntity,
    SystemEntity,
    InventoryTypeEntity,
    SpinSlotEntity,
    TempEntity
} from "@src/databases"

@Injectable()
export class SeedersService {
    private readonly logger = new Logger(SeedersService.name)
    private database: PostgreSQLDatabase
    private readonly seedTableName: string
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: SeederOptions
    ) {
        this.seedTableName = options.seedTableName || "seeds"
        this.database = this.options.database || PostgreSQLDatabase.Gameplay
    }
    async runSeeders({ dataSource, seedTracking }: RunSeedersParams): Promise<void> {
        // define the seeders to run
        const seederMap: Record<PostgreSQLDatabase, Array<SeederConstructor>> = {
            [PostgreSQLDatabase.Gameplay]: gameplaySeeders(),
            [PostgreSQLDatabase.Telegram]: gameplaySeeders()
        }
        await typeOrmRunSeeders(dataSource, {
            seedTableName: this.seedTableName,
            seedTracking: seedTracking || true,
            seeds: seederMap[this.database]
        })
    }

    async clearSeeders(dataSource: DataSource): Promise<void> {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            await queryRunner.startTransaction()
            if (this.database === PostgreSQLDatabase.Gameplay) {
                //delete this sequently
                await queryRunner.manager.delete(TempEntity, {})
                await queryRunner.manager.delete(AnimalEntity, {})
                await queryRunner.manager.delete(SpinPrizeEntity, {})
                await queryRunner.manager.delete(CropEntity, {})
                await queryRunner.manager.delete(UpgradeEntity, {})
                await queryRunner.manager.delete(BuildingEntity, {})
                await queryRunner.manager.delete(ToolEntity, {})
                await queryRunner.manager.delete(TileEntity, {})
                await queryRunner.manager.delete(SupplyEntity, {})
                await queryRunner.manager.delete(DailyRewardEntity, {})
                await queryRunner.manager.delete(SystemEntity, {})
                await queryRunner.manager.delete(InventoryTypeEntity, {})
                await queryRunner.manager.delete(SpinSlotEntity, {})
            }
            await queryRunner.manager.query(`DROP TABLE IF EXISTS ${this.seedTableName};`)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            this.logger.error(`Failed to clear old data: ${error.message}`)
        } finally {
            await queryRunner.release()
        }
    }
}

export interface RunSeedersParams {
    dataSource: DataSource
    seedTracking?: boolean
}
