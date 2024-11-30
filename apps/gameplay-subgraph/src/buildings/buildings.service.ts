import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetBuildingsArgs } from "./"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getBuildings({
        limit = 10,
        offset = 0
    }: GetBuildingsArgs): Promise<Array<BuildingEntity>> {
        this.logger.debug(`GetBuildings: limit=${limit}, offset=${offset}`)

        let buildings: Array<BuildingEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            buildings = await queryRunner.manager.find(BuildingEntity, {
                take: limit,
                skip: offset,
                relations: {
                    placedItemType: true,
                    upgrades: true
                }
            })
        } finally {
            await queryRunner.release()
        }
        return buildings
    }
}
