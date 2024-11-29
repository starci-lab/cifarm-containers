import { Injectable, Logger } from "@nestjs/common"
import { CropEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetCropsArgs } from "./crops.dto"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getCrops({ limit = 10, offset = 0 }: GetCropsArgs): Promise<Array<CropEntity>> {
        this.logger.debug(`GetCrops: limit=${limit}, offset=${offset}`)

        let crops: Array<CropEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            crops = await this.dataSource.getRepository(CropEntity).find({
                take: limit,
                skip: offset,
                relations:["inventoryType"]
            })
        } finally {
            await queryRunner.release()
        }
        return crops
    }
}
