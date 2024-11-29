import { GetPlacedItemTypesArgs } from "@apps/static-subgraph/src/placed-item-types"
import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemTypeEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class PlacedItemTypesService {
    private readonly logger = new Logger(PlacedItemTypesService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getPlacedItemTypes({
        limit = 10,
        offset = 0
    }: GetPlacedItemTypesArgs): Promise<Array<PlacedItemTypeEntity>> {
        this.logger.debug(`GetPlacedItemTypes: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placeditemtypes = await this.dataSource.getRepository(PlacedItemTypeEntity).find({
                take: limit,
                skip: offset
            })
            return placeditemtypes
        } finally {
            await queryRunner.release()
        }
    }
}
