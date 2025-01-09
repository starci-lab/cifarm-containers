import {
    AppearanceChance,
    SpinInfo,
    SpinPrizeEntity,
    SpinSlotEntity,
    SystemEntity,
    SystemId
} from "@src/databases"
import { DataSource, DeepPartial } from "typeorm"
import { Seeder } from "typeorm-extension"
import { Logger } from "@nestjs/common"

export class SpinSlotSeeder implements Seeder {
    private readonly logger = new Logger(SpinSlotSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding spin slot...")
        // get system data
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: {
                id: SystemId.SpinInfo
            }
        })
        const { appearanceChanceSlots } = value as SpinInfo

        const commonPrizes = await dataSource.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.Common
            },
            take: appearanceChanceSlots[AppearanceChance.Common].count
        })
        //get all uncommon prizes
        const uncommonPrizes = await dataSource.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.Uncommon
            },
            take: appearanceChanceSlots[AppearanceChance.Uncommon].count
        })
        //get all rare prizes
        const rarePrizes = await dataSource.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.Rare
            },
            take: appearanceChanceSlots[AppearanceChance.Rare].count
        })
        //get all very rare prizes
        const veryRarePrizes = await dataSource.manager.find(SpinPrizeEntity, {
            where: {
                appearanceChance: AppearanceChance.VeryRare
            },
            take: appearanceChanceSlots[AppearanceChance.VeryRare].count
        })
        const data: Array<DeepPartial<SpinSlotEntity>> = [
            ...commonPrizes.map((prize) => ({
                spinPrizeId: prize.id
            })),
            ...uncommonPrizes.map((prize) => ({
                prize,
                spinPrizeId: prize.id
            })),
            ...rarePrizes.map((prize) => ({
                prize,
                spinPrizeId: prize.id
            })),
            ...veryRarePrizes.map((prize) => ({
                prize,
                spinPrizeId: prize.id
            }))
        ]
        await dataSource.manager.save(SpinSlotEntity, data)
        this.logger.verbose("Spin slot seeded successfully.")
    }
}
