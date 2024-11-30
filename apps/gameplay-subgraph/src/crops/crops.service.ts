import { Injectable, Logger } from "@nestjs/common"
import { CropEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetCropsArgs } from "./"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getCrops({ limit = 10, offset = 0 }: GetCropsArgs): Promise<Array<CropEntity>> {
        this.logger.debug(`GetCrops: limit=${limit}, offset=${offset}`)

        let crops: Array<CropEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            crops = await queryRunner.manager.find(CropEntity, {
                take: limit,
                skip: offset,
<<<<<<< HEAD:apps/gameplay-subgraph/src/crops/crops.service.ts
                relations: {
                    inventoryType: true,
                    product: true,
                }
=======
                relations: ["inventoryType"]
>>>>>>> f9c45204f39ad3d2d2a36bea9f7f920c9ee7c2fd:apps/static-subgraph/src/crops/crops.service.ts
            })
        } finally {
            await queryRunner.release()
        }
        return crops
    }
}
