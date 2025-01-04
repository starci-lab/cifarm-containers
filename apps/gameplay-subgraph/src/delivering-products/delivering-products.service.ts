import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductEntity, GameplayPostgreSQLService } from "@src/databases"
import { DataSource } from "typeorm"
import { GetDeliveringProductsArgs } from "./delivering-products.dto"
import { UserLike } from "@src/jwt"

@Injectable()
export class DeliveringProductService {
    private readonly logger = new Logger(DeliveringProductService.name)

    private readonly relations = {
        product: true
    }

    private readonly dataSource: DataSource

    constructor(private readonly gameplayPostgreSqlService: GameplayPostgreSQLService) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getDeliveringProduct(id: string): Promise<DeliveringProductEntity | null> {
        this.logger.debug(`GetDeliveringProductById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const deliveringProduct = await queryRunner.manager.findOne(DeliveringProductEntity, {
                where: { id },
                relations: this.relations
            })
            return deliveringProduct
        } finally {
            await queryRunner.release()
        }
    }

    async getDeliveringProducts(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetDeliveringProductsArgs
    ): Promise<Array<DeliveringProductEntity>> {
        this.logger.debug(
            `GetDeliveringProductsByUserId: userId=${id}, limit=${limit}, offset=${offset}`
        )
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const deliveringProducts = await queryRunner.manager.find(DeliveringProductEntity, {
                where: { userId: id },
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return deliveringProducts
        } finally {
            await queryRunner.release()
        }
    }
}
