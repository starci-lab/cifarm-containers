import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { GetBuildingsArgs } from "./buildings.dto"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    private readonly relations = {
        placedItemType: true,
        upgrades: true
    }

    
        
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) { }

    async getBuildings({
        limit = 10,
        offset = 0
    }: GetBuildingsArgs): Promise<Array<BuildingEntity>> {
        this.logger.debug(`GetBuildings: limit=${limit}, offset=${offset}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(BuildingEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getBuildingById(id: string): Promise<BuildingEntity> {
        this.logger.debug(`GetBuildingById: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(BuildingEntity, {
                where: { id },
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
    }
}
