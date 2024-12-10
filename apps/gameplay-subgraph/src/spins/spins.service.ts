import { Injectable, Logger } from "@nestjs/common"
import { SpinSlotEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSpinsArgs } from "./"

@Injectable()
export class SpinsService {
    private readonly logger = new Logger(SpinsService.name)

    private readonly relations = {
        spinPrize: true,
    }

    constructor(
        private readonly dataSource: DataSource,
    ) {}

    async getSpins({ limit = 10, offset = 0 }: GetSpinsArgs): Promise<Array<SpinSlotEntity>> {
        this.logger.debug(`GetSpinSlots: limit=${limit}, offset=${offset}`)

        let spins: Array<SpinSlotEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            spins = await queryRunner.manager.find(SpinSlotEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
        } finally {
            await queryRunner.release()
        }
        return spins
    }

    async getSpinSlotById(id: string): Promise<SpinSlotEntity | null> {
        this.logger.debug(`GetSpinSlotById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const spinSlot = await queryRunner.manager.findOne(SpinSlotEntity, {
                where: { id },
                relations: this.relations
            })
            return spinSlot
        } finally {
            await queryRunner.release()
        }
    }
}
