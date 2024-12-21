import { GetPlacedItemsArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    private readonly relations = {
        parent: true,
        placedItemType: true,
        seedGrowthInfo: true,
        animalInfo: true,
        buildingInfo: true,
        placedItems: true,
    }

    constructor(private readonly dataSource: DataSource) {}

    async getPlacedItems({
        limit = 10,
        offset = 0
    }: GetPlacedItemsArgs): Promise<Array<PlacedItemEntity>> {
        this.logger.debug(`GetPlacedItems: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItems = await queryRunner.manager.find(PlacedItemEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return placedItems
        } finally {
            await queryRunner.release()
        }
    }

    async getPlacedItemById(id: string): Promise<PlacedItemEntity> {
        this.logger.debug(`GetPlacedItemById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }
}
