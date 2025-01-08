import { GetInventoriesArgs } from "./inventories.dto"
import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, InventoryEntity } from "@src/databases"
import { UserLike } from "@src/jwt"
import { DataSource } from "typeorm"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async getInventory(id: string): Promise<InventoryEntity> {
        this.logger.debug(`GetInventoryById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(InventoryEntity, {
                where: { id }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getInventories(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetInventoriesArgs
    ): Promise<Array<InventoryEntity>> {
        this.logger.debug(`GetInventories: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const inventories = await queryRunner.manager.find(InventoryEntity, {
                take: limit,
                skip: offset,
                where: { userId: id }
            })
            return inventories
        } finally {
            await queryRunner.release()
        }
    }
}
