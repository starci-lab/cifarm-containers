import { GetPlacedItemsArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService, PlacedItemEntity } from "@src/databases"
import { UserLike } from "@src/jwt"
import { DataSource, FindOptionsRelations } from "typeorm"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    private readonly relations: FindOptionsRelations<PlacedItemEntity> = {
        parent: true,
        placedItemType: true,
        seedGrowthInfo: true,
        animalInfo: true,
        buildingInfo: true,
        placedItems: true
    }

    private readonly dataSource: DataSource

    constructor(private readonly gameplayPostgreSqlService: GameplayPostgreSQLService) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

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
    ): Promise<Array<PlacedItemEntity>> {
        this.logger.debug(`GetPlacedItems: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(PlacedItemEntity, {
                take: limit,
                skip: offset,
                relations: this.relations,
                where: {
                    userId: id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
