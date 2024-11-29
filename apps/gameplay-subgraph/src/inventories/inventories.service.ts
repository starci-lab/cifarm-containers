import { GetInventoriesArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getInventories({ limit = 10, offset = 0 }: GetInventoriesArgs): Promise<Array<InventoryEntity>> {
        this.logger.debug(`GetInventories: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const inventories = await queryRunner.manager.find(InventoryEntity,{
                take: limit,
                skip: offset,
                relations: {
                    inventoryType: true,
                }
            })
            return inventories
        } finally {
            await queryRunner.release()
        }
    }

}