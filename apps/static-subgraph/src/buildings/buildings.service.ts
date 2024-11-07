import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetBuildingsArgs } from "./buildings.dto"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    constructor(private readonly dataSource: DataSource) {}
    
    async getBuildings({
        limit = 10,
        offset = 0,
    }: GetBuildingsArgs): Promise<Array<BuildingEntity>> {
        this.logger.debug(`GetBuildings: limit=${limit}, offset=${offset}`)
        return this.dataSource.manager.find(BuildingEntity, {
            take: limit,
            skip: offset,
        })
    }
}
