import { Injectable, Logger } from "@nestjs/common"
import { CacheQueryRunnerService, InjectPostgreSQL, SpinSlotEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class SpinSlotsService {
    private readonly logger = new Logger(SpinSlotsService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async getSpinSlots(): Promise<Array<SpinSlotEntity>> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.find(queryRunner, SpinSlotEntity)
        } finally {
            await queryRunner.release()
        }
    }

    async getSpinSlot(id: string): Promise<SpinSlotEntity> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            return await this.cacheQueryRunnerService.findOne(queryRunner, SpinSlotEntity, {
                where: {
                    id
                }
            })
        } finally {
            await queryRunner.release()
        }
    }
}
