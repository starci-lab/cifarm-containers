import { GetPlacedItemTypesArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemTypeEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class PlacedItemTypesService {
    private readonly logger = new Logger(PlacedItemTypesService.name)

    private readonly relations = {
        placedItems: true,
        building: true,
        animal: true,
        tile: true,
    }

    constructor(private readonly dataSource: DataSource) {}

    async getPlacedItemTypes({
        limit = 10,
        offset = 0
    }: GetPlacedItemTypesArgs): Promise<Array<PlacedItemTypeEntity>> {
        this.logger.debug(`GetPlacedItemTypes: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTypes = await queryRunner.manager.find(PlacedItemTypeEntity, {
                take: limit,
                skip: offset,
                relations:this.relations
            })
            return placedItemTypes
        } finally {
            await queryRunner.release()
        }
    }

    async getPlacedItemTypeById(id: string): Promise<PlacedItemTypeEntity> {
        this.logger.debug(`GetPlacedItemTypeById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: { id },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }
}
