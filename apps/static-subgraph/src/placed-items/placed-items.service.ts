import { GetPlacedItemsArgs } from "@apps/static-subgraph/src/placed-items"
import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getPlacedItems({
        limit = 10,
        offset = 0
    }: GetPlacedItemsArgs): Promise<Array<PlacedItemEntity>> {
        this.logger.debug(`GetPlacedItems: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placeditems = await this.dataSource.getRepository(PlacedItemEntity).find({
                take: limit,
                skip: offset
            })
            return placeditems
        } finally {
            await queryRunner.release()
        }
    }
}
