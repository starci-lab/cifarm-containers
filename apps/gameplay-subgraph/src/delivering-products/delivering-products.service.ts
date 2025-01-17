import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { GetDeliveringProductsArgs, GetDeliveringProductsResponse } from "./delivering-products.dto"
import { UserLike } from "@src/jwt"

@Injectable()
export class DeliveringProductsService {
    private readonly logger = new Logger(DeliveringProductsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) { }

    async getDeliveringProduct(id: string): Promise<DeliveringProductEntity | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const deliveringProduct = await queryRunner.manager.findOne(DeliveringProductEntity, {
                where: { id },
            })
            return deliveringProduct
        } finally {
            await queryRunner.release()
        }
    }

    async getDeliveringProducts(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetDeliveringProductsArgs
    ): Promise<GetDeliveringProductsResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const [data, count] = await queryRunner.manager.findAndCount(DeliveringProductEntity, {
                where: { userId: id },
                take: limit,
                skip: offset,
            })
            return {
                data,
                count
            }
        } finally {
            await queryRunner.release()
        }
    }
}
