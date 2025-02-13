import { Injectable } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemSchema } from "@src/databases"
import { DataSource } from "typeorm"
import { GetPlacedItemsParams } from "./placed-items.types"

@Injectable()
export class PlacedItemsService {
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    public async getPlacedItems({ userId }: GetPlacedItemsParams) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(PlacedItemSchema, {
                where: {
                    userId
                },
                relations: {
                    animalInfo: true,
                    seedGrowthInfo: true,
                    tileInfo: true,
                    buildingInfo: true
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}