import { Injectable, Logger } from "@nestjs/common"
import { CropId, CropSchema } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    crops(): Array<CropSchema> {
        return this.staticService.crops
    }

    crop(id: CropId): CropSchema {
        return this.staticService.crops.find((crop) => crop.displayId === id)
    }
}
