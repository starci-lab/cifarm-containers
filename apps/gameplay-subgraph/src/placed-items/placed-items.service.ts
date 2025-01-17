import { GetPlacedItemsArgs, GetPlacedItemsResponse } from "./placed-items.dto"
import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemEntity } from "@src/databases"
import { UserLike } from "@src/jwt"
import { DataSource, FindOptionsRelations } from "typeorm"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    private readonly relations: FindOptionsRelations<PlacedItemEntity> = {
        animalInfo: true,
        buildingInfo: true,
        seedGrowthInfo: true
    }

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async getPlacedItem(id: string): Promise<PlacedItemEntity> {
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

    async getPlacedItems(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetPlacedItemsArgs
    ): Promise<GetPlacedItemsResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const [data, count] = await queryRunner.manager.findAndCount(PlacedItemEntity, {
                take: limit,
                skip: offset,
                where: {
                    userId: id
                },
                relations: this.relations
            })
            return {
                data,
                count
            }
        } finally {
            await queryRunner.release()
        }
    }
}
