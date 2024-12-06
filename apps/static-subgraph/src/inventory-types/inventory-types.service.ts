import { GetInventoryTypesArgs } from "@apps/static-subgraph/src/inventory-types/inventory-types.dto"
import { Injectable, Logger } from "@nestjs/common"
import { InventoryTypeEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class InventoryTypeService {
    private readonly logger = new Logger(InventoryTypeService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getInventoryTypes({
        limit = 10,
        offset = 0
    }: GetInventoryTypesArgs): Promise<Array<InventoryTypeEntity>> {
        this.logger.debug(`GetInventoryTypes: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const inventoryTypes = await this.dataSource.getRepository(InventoryTypeEntity).find({
                take: limit,
                skip: offset
            })
            return inventoryTypes
        } finally {
            await queryRunner.release()
        }
    }
}
