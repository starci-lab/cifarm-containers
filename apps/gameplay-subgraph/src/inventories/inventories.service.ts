import { GetInventoriesArgs, GetInventoriesByUserIdArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService, InventoryEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    private readonly relations = {
        inventoryType: true,
    }

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getInventories({
        limit = 10,
        offset = 0
    }: GetInventoriesArgs): Promise<Array<InventoryEntity>> {
        this.logger.debug(`GetInventories: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const inventories = await queryRunner.manager.find(InventoryEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return inventories
        } finally {
            await queryRunner.release()
        }
    }

    async getInventoryById(id: string): Promise<InventoryEntity> {
        this.logger.debug(`GetInventoryById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(InventoryEntity, {
                where: { id },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getInventoriesByUserId({
        userId,
        limit = 10,
        offset = 0
    }: GetInventoriesByUserIdArgs): Promise<Array<InventoryEntity>> {
        this.logger.debug(`GetInventoriesByUserId: userId=${userId}, limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const inventories = await queryRunner.manager.find(InventoryEntity, {
                where: { userId },
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return inventories
        } finally {
            await queryRunner.release()
        }
    }
}
