import { Injectable, Logger } from "@nestjs/common"
import { SupplyEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSuppliesArgs } from "./supplies.dto"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getSupplies({ limit = 10, offset = 0 }: GetSuppliesArgs): Promise<Array<SupplyEntity>> {
        this.logger.debug(`GetSupplies: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const supplies = await this.dataSource.getRepository(SupplyEntity).find({
                take: limit,
                skip: offset,
                relations: ["inventoryType"]
            })
            return supplies
        } finally {
            await queryRunner.release()
        }
    }
}
