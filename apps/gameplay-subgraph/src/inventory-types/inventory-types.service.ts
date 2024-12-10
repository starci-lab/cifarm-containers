import { GetInventoryTypesArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { InventoryTypeEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class InventoryTypeService {
    private readonly logger = new Logger(InventoryTypeService.name)

    private readonly relations = {
        animal: true,
        product: true,
        crop: true,
        supply: true,
        tile: true,
        inventories: true,
    }

    constructor(private readonly dataSource: DataSource) {}

    async getInventoryTypes({
        limit = 10,
        offset = 0
    }: GetInventoryTypesArgs): Promise<Array<InventoryTypeEntity>> {
        this.logger.debug(`GetInventoryTypes: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const inventoryTypes = await queryRunner.manager.find(InventoryTypeEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return inventoryTypes
        } finally {
            await queryRunner.release()
        }
    }

    async getInventoryTypeById(id: string): Promise<InventoryTypeEntity> {
        this.logger.debug(`GetInventoryTypeById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { id },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }
}
