import { Injectable, Logger } from "@nestjs/common"
import {
    AppearanceChance,
    CropKey,
    InjectMongoose,
    SpinPrizeSchema,
    SpinPrizeType,
    SupplyKey,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class SpinPrizeSeeder implements Seeder {
    private readonly logger = new Logger(SpinPrizeSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding spin prizes...")
        const data: Array<Partial<SpinPrizeSchema>> = [
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                quantity: 100
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                quantity: 100
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Common,
                quantity: 100
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Uncommon,
                quantity: 100
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Uncommon,
                quantity: 100
            },
            {
                type: SpinPrizeType.Gold,
                appearanceChance: AppearanceChance.Rare,
                quantity: 100
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Common,
                refKey: CropKey.Carrot,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: CropKey.Pineapple,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: CropKey.Cucumber,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: CropKey.Potato,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: CropKey.Watermelon,
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: CropKey.BellPepper,
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.BasicFertilizer,
                quantity: 2
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.BasicFertilizer,
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.BasicFertilizer,
                quantity: 4
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.BasicFertilizer,
                quantity: 5
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.AnimalFeed,
                quantity: 2
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.AnimalFeed,
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.AnimalFeed,
                quantity: 4
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                refKey: SupplyKey.AnimalFeed,
                quantity: 5
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                quantity: 5
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                quantity: 10
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                quantity: 15
            },
            {
                type: SpinPrizeType.Token,
                appearanceChance: AppearanceChance.VeryRare,
                quantity: 20
            }
        ]

        await this.connection.model<SpinPrizeSchema>(SpinPrizeSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping spin prizes...")
        await this.connection.model<SpinPrizeSchema>(SpinPrizeSchema.name).deleteMany({})
    }
}