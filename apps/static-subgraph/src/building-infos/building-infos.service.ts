import { GetBuildingInfosArgs } from "@apps/static-subgraph/src/building-infos/building-infos.dto"
import { Injectable, Logger } from "@nestjs/common"
import { BuildingInfoEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class BuildingInfosService {
    private readonly logger = new Logger(BuildingInfosService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getBuildingInfos({
        limit = 10,
        offset = 0
    }: GetBuildingInfosArgs): Promise<Array<BuildingInfoEntity>> {
        this.logger.debug(`GetBuildingInfos: limit=${limit}, offset=${offset}`)

        let buildingInfos: Array<BuildingInfoEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            buildingInfos = await this.dataSource.getRepository(BuildingInfoEntity).find({
                take: limit,
                skip: offset,
                relations: ["building", "placedItem"]
            })
        } finally {
            await queryRunner.release()
        }
        return buildingInfos
    }
}
