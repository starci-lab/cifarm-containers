import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    AppearanceChance,
    CropId,
    InjectMongoose,
    SpinPrizeSchema,
    SpinPrizeType,
    SupplyId,
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
                crop: createObjectId(CropId.Carrot),
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                crop: createObjectId(CropId.Pineapple),
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                crop: createObjectId(CropId.Cucumber),
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                crop: createObjectId(CropId.Potato),
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                crop: createObjectId(CropId.Watermelon),
                quantity: 3
            },
            {
                type: SpinPrizeType.Seed,
                appearanceChance: AppearanceChance.Uncommon,
                crop: createObjectId(CropId.BellPepper),
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.BasicFertilizer),
                quantity: 2
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.BasicFertilizer),
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.BasicFertilizer),
                quantity: 4
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.BasicFertilizer),
                quantity: 5
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.AnimalFeed),
                quantity: 2
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.AnimalFeed),
                quantity: 3
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.AnimalFeed),
                quantity: 4
            },
            {
                type: SpinPrizeType.Supply,
                appearanceChance: AppearanceChance.Uncommon,
                supply: createObjectId(SupplyId.AnimalFeed),
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