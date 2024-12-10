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

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.find(CropEntity, {
                take: limit,
                skip: offset,
                relations: {
                    inventoryType: true,
                    product: true,
                }
            })
        } finally {
            await queryRunner.release()
        }
    }

    async getCropById(id: string): Promise<CropEntity> {
        this.logger.debug(`GetCropById: id=${id}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await queryRunner.manager.findOne(CropEntity, {
                where: { id },
                relations: {
                    inventoryType: true,
                    product: true,
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
