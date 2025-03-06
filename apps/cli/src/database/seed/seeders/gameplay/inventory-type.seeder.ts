import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, DeepPartial } from "@src/common"
import {
    CropId,
    InjectMongoose,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    ProductId,
    SupplyId,
    ToolId,
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
        const data: Array<DeepPartial<InventoryTypeSchema>> = [
            {
                _id: createObjectId(InventoryTypeId.Egg),
                displayId: InventoryTypeId.Egg,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Egg),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.EggQuality),
                displayId: InventoryTypeId.EggQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.EggQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Milk),
                displayId: InventoryTypeId.Milk,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Milk),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.MilkQuality),
                displayId: InventoryTypeId.MilkQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.MilkQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Radish),
                displayId: InventoryTypeId.Radish,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Radish),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.RadishQuality),
                displayId: InventoryTypeId.RadishQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.RadishQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Carrot),
                displayId: InventoryTypeId.Carrot,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Carrot),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.CarrotQuality),
                displayId: InventoryTypeId.CarrotQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.CarrotQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Potato),
                displayId: InventoryTypeId.Potato,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Potato),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.PotatoQuality),
                displayId: InventoryTypeId.PotatoQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.PotatoQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Pineapple),
                displayId: InventoryTypeId.Pineapple,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Pineapple),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.PineappleQuality),
                displayId: InventoryTypeId.PineappleQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.PineappleQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Watermelon),
                displayId: InventoryTypeId.Watermelon,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Watermelon),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.WatermelonQuality),
                displayId: InventoryTypeId.WatermelonQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.WatermelonQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Cucumber),
                displayId: InventoryTypeId.Cucumber,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Cucumber),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.CucumberQuality),
                displayId: InventoryTypeId.CucumberQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.CucumberQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.BellPepper),
                displayId: InventoryTypeId.BellPepper,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.BellPepper),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.BellPepperQuality),
                displayId: InventoryTypeId.BellPepperQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.BellPepperQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.RadishSeed),
                displayId: InventoryTypeId.RadishSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Radish),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.CarrotSeed),
                displayId: InventoryTypeId.CarrotSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Carrot),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.PotatoSeed),
                displayId: InventoryTypeId.PotatoSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Potato),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.PineappleSeed),
                displayId: InventoryTypeId.PineappleSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Pineapple),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.WatermelonSeed),
                displayId: InventoryTypeId.WatermelonSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Watermelon),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.CucumberSeed),
                displayId: InventoryTypeId.CucumberSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Cucumber),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.BellPepperSeed),
                displayId: InventoryTypeId.BellPepperSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.BellPepper),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.BasicFertilizer),
                displayId: InventoryTypeId.BasicFertilizer,
                asTool: true,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                supply: createObjectId(SupplyId.BasicFertilizer),
                type: InventoryType.Supply
            },
            {
                _id: createObjectId(InventoryTypeId.AnimalFeed),
                displayId: InventoryTypeId.AnimalFeed,
                asTool: true,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                supply: createObjectId(SupplyId.AnimalFeed),
                type: InventoryType.Supply
            },
            {
                _id: createObjectId(InventoryTypeId.AnimalPill),
                displayId: InventoryTypeId.AnimalPill,
                asTool: true,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                supply: createObjectId(SupplyId.AnimalPill),
                type: InventoryType.Supply
            },
            {
                _id: createObjectId(InventoryTypeId.Hand),
                displayId: InventoryTypeId.Hand,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.Hand),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.Crate),
                displayId: InventoryTypeId.Crate,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(InventoryTypeId.Crate),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.ThiefHand),
                displayId: InventoryTypeId.ThiefHand,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.ThiefHand),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.WateringCan),
                displayId: InventoryTypeId.WateringCan,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.WateringCan),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.Pesticide),
                displayId: InventoryTypeId.Pesticide,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.Pesticide),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.Herbicide),
                displayId: InventoryTypeId.Herbicide,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.Herbicide),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.Hammer),
                displayId: InventoryTypeId.Hammer,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.Hammer),
                type: InventoryType.Tool
            }
        ]

        await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping inventory types...")
        await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).deleteMany({})
    }
}