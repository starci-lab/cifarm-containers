import { Logger } from "@nestjs/common"
import { AppearanceChance, CropId, SpinPrizeEntity, SpinPrizeType, SupplyId } from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class SpinPrizeSeeder implements Seeder {
    private readonly logger = new Logger(SpinPrizeSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding spin prizes...")
        await dataSource.manager.save(SpinPrizeEntity, [
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                golds: 100
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                golds: 200
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                golds: 300
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Uncommon,
                golds: 500
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Uncommon,
                golds: 1000
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Rare,
                golds: 2000
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Common,
                cropId: CropId.Carrot,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Pineapple,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Cucumber,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Potato,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.Watermelon,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                cropId: CropId.BellPepper,
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 2
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 4
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.BasicFertilizer,
                quantity: 5
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 2
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 4
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supplyId: SupplyId.AnimalFeed,
                quantity: 5
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 5
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 10
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 15
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                tokens: 20
            }
        ])
        this.logger.verbose("Spin prizes seeded successfully.")
    }
}
