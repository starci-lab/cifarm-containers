import { Injectable, Logger } from "@nestjs/common"
import { CropEntity } from "@src/database"
import { CropNotFoundException } from "@src/exceptions/static/crop.exception"
import { DataSource } from "typeorm"
import {
    CreateCropRequest,
    CreateCropResponse,
    DeleteCropRequest,
    DeleteCropResponse,
    GetCropRequest,
    GetCropResponse,
    GetCropsResponse,
    UpdateCropRequest,
    UpdateCropResponse
} from "./crop.dto"

@Injectable()
export class CropService {
    private readonly logger: Logger = new Logger(CropService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async getCrops(): Promise<GetCropsResponse> {
        const items = await this.dataSource.manager.find(CropEntity)
        return { items }
    }

    public async getCrop(request: GetCropRequest): Promise<GetCropResponse> {
        const item = await this.dataSource.manager.findOne(CropEntity, {
            where: { id: request.id }
        })
        if (!item) {
            throw new CropNotFoundException(request.id)
        }
        return item
    }

    public async createCrop(request: CreateCropRequest): Promise<CreateCropResponse> {
        const { id } = await this.dataSource.manager.save(CropEntity, {
            ...request.item
        })
        return { id }
    }

    // Update an existing crop
    public async updateCrop(request: UpdateCropRequest): Promise<UpdateCropResponse> {
        const item = this.dataSource.manager.findOne(CropEntity, {
            where: { id: request.id }
        })
        if (!item) {
            throw new CropNotFoundException(request.id)
        }

        await this.dataSource.manager.save(CropEntity, {
            ...request.item,
            id: request.id
        })
        return {}
    }

    public async deleteCrop(request: DeleteCropRequest): Promise<DeleteCropResponse> {
        const item = this.dataSource.manager.findOne(CropEntity, {
            where: { id: request.id }
        })

        if (!item) {
            throw new CropNotFoundException(request.id)
        }

        await this.dataSource.manager.delete(CropEntity, item)
        return {}
    }
}
