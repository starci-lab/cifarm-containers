import { Injectable, Logger } from "@nestjs/common"
import {
    CropKey,
    InjectMongoose,
    InventoryType,
    InventoryTypeKey,
    InventoryTypeSchema,
    ProductKey,
    SupplyKey,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class InventoryTypeSeeder implements Seeder {
    private readonly logger = new Logger(InventoryTypeSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding inventory types...")
        const data: Array<Partial<InventoryTypeSchema>> = [
            {
                key: InventoryTypeKey.Egg,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Egg,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.EggQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.EggQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.Milk,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Milk,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.MilkQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.MilkQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.Carrot,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Carrot,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.CarrotQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.CarrotQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.Potato,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Potato,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.PotatoQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.PotatoQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.Pineapple,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Pineapple,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.PineappleQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.PineappleQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.Watermelon,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Watermelon,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.WatermelonQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.WatermelonQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.Cucumber,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.Cucumber,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.CucumberQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.CucumberQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.BellPepper,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.BellPepper,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.BellPepperQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                refKey: ProductKey.BellPepperQuality,
                type: InventoryType.Product
            },
            {
                key: InventoryTypeKey.CarrotSeed,  // Complete the entry here
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                refKey: CropKey.Carrot,
                type: InventoryType.Seed
            },
            {
                key: InventoryTypeKey.PotatoSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                refKey: CropKey.Potato,
                type: InventoryType.Seed
            },
            {
                key: InventoryTypeKey.PineappleSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                refKey: CropKey.Pineapple,
                type: InventoryType.Seed
            },
            {
                key: InventoryTypeKey.WatermelonSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                refKey: CropKey.Watermelon,
                type: InventoryType.Seed
            },
            {
                key: InventoryTypeKey.CucumberSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                refKey: CropKey.Cucumber,
                type: InventoryType.Seed
            },
            {
                key: InventoryTypeKey.BellPepperSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                refKey: CropKey.BellPepper,
                type: InventoryType.Seed
            },
            {
                key: InventoryTypeKey.BasicFertilizer,
                asTool: true,
                deliverable: false,
                maxStack: 50,
                placeable: false,
                refKey: SupplyKey.BasicFertilizer,
                type: InventoryType.Supply
            },
            {
                key: InventoryTypeKey.AnimalFeed,
                asTool: true,
                deliverable: false,
                maxStack: 50,
                placeable: false,
                refKey: SupplyKey.AnimalFeed,
                type: InventoryType.Supply
            }
        ]

        await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping inventory types...")
        await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).deleteMany({})
    }
}