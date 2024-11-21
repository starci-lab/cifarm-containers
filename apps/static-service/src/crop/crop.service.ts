import { Injectable, Logger } from "@nestjs/common"
import { CropEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetCropRequest, GetCropResponse, GetCropsResponse } from "./crop.dto"

@Injectable()
export class CropService {
    private readonly logger: Logger = new Logger(CropService.name)
    constructor(private readonly dataSource: DataSource) {}

    public async getCrops(): Promise<GetCropsResponse> {
        const items = await this.dataSource.manager.find(CropEntity)
        return {
            items
        }
    }

    public async getCrop(request: GetCropRequest): Promise<GetCropResponse> {
        const item = await this.dataSource.manager.findOne(CropEntity, {
            where: { id: request.id }
        })
        return item
    }
}
