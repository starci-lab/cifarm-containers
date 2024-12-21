import { Injectable, Logger } from "@nestjs/common"
import { BuildingInfoEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetBuildingInfosArgs } from "./building-infos.dto"

@Injectable()
export class BuildingInfosService {
    private readonly logger = new Logger(BuildingInfosService.name)

    private readonly relations = {
        building: true,
        placedItem: true
    }

    constructor(private readonly dataSource: DataSource) {}

    async getBuildingInfos({
        limit = 10,
        offset = 0
    }: GetBuildingInfosArgs): Promise<Array<BuildingInfoEntity>> {
        this.logger.debug(`GetBuildingInfos: limit=${limit}, offset=${offset}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(BuildingInfoEntity, {
                take: limit,
                skip: offset,
                relations: this.relations,
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getBuildingInfoById(id: string): Promise<BuildingInfoEntity> {
        this.logger.debug(`GetBuildingInfoById: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(BuildingInfoEntity, {
                where: { id },
                relations: this.relations,
            })
        } finally {
            await queryRunner.release()
        }
    }
}
