import { Injectable, Logger } from "@nestjs/common"
import { BuildingEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    CreateBuildingRequest,
    CreateBuildingResponse,
    DeleteBuildingRequest,
    DeleteBuildingResponse,
    GetBuildingRequest,
    GetBuildingResponse,
    GetBuildingsResponse,
    UpdateBuildingRequest,
    UpdateBuildingResponse
} from "./building.dto"
import { BuildingNotFoundException } from "@src/exceptions/static/building.exception"

@Injectable()
export class BuildingService {
    private readonly logger: Logger = new Logger(BuildingService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async getBuildings(): Promise<GetBuildingsResponse> {
        const items = await this.dataSource.manager.find(BuildingEntity)
        return { items }
    }

    public async getBuilding(request: GetBuildingRequest): Promise<GetBuildingResponse> {
        const item = await this.dataSource.manager.findOne(BuildingEntity, {
            where: { id: request.id }
        })
        if (!item) {
            throw new BuildingNotFoundException(request.id)
        }
        return item
    }

    public async createBuilding(request: CreateBuildingRequest): Promise<CreateBuildingResponse> {
        const { id } = await this.dataSource.manager.save(BuildingEntity, {
            ...request.item
        })
        return { id }
    }

    // Update an existing Building
    public async updateBuilding(request: UpdateBuildingRequest): Promise<UpdateBuildingResponse> {
        const item = this.dataSource.manager.findOne(BuildingEntity, {
            where: { id: request.id }
        })
        if (!item) {
            throw new BuildingNotFoundException(request.id)
        }

        await this.dataSource.manager.save(BuildingEntity, {
            ...request.item,
            id: request.id
        })
        return {}
    }

    public async deleteBuilding(request: DeleteBuildingRequest): Promise<DeleteBuildingResponse> {
        const item = this.dataSource.manager.findOne(BuildingEntity, {
            where: { id: request.id }
        })

        if (!item) {
            throw new BuildingNotFoundException(request.id)
        }

        await this.dataSource.manager.delete(BuildingEntity, item)
        return {}
    }
}
