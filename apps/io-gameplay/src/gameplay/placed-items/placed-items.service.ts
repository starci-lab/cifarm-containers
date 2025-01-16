import { Injectable } from "@nestjs/common"
import { InjectPostgreSQL, PlacedItemEntity, UserEntity } from "@src/databases"
import { DataSource, In } from "typeorm"
import { GetVisitingUserIdsParams, GetPlacedItemsParams } from "./placed-items.types"

@Injectable()
export class PlacedItemsService {
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    public async getVisitingUserIds({ userId }: GetVisitingUserIdsParams) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(UserEntity, {
                where: {
                    visitingUserId: In([userId, null])
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    public async getPlacedItems({ userId }: GetPlacedItemsParams) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(PlacedItemEntity, {
                where: {
                    userId
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}