import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    CropId,
    InjectMongoose,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    ProductKey,
    SupplyId,
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
                _id: createObjectId(InventoryTypeId.Egg),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Egg),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.EggQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.EggQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Milk),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Milk),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.MilkQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.MilkQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Carrot),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Carrot),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.CarrotQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.CarrotQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Potato),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Potato),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.PotatoQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.PotatoQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Pineapple),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Pineapple),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.PineappleQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.PineappleQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Watermelon),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Watermelon),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.WatermelonQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.WatermelonQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Cucumber),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.Cucumber),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.CucumberQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.CucumberQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.BellPepper),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.BellPepper),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.BellPepperQuality),
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductKey.BellPepperQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.CarrotSeed),
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Carrot),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.PotatoSeed),
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Potato),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.PineappleSeed),
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Pineapple),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.WatermelonSeed),
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Watermelon),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.CucumberSeed),
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.Cucumber),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.BellPepperSeed),
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                crop: createObjectId(CropId.BellPepper),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.BasicFertilizer),
                asTool: true,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                supply: createObjectId(SupplyId.BasicFertilizer),
                type: InventoryType.Supply
            },
            {
                _id: createObjectId(InventoryTypeId.AnimalFeed),
                asTool: true,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                supply: createObjectId(SupplyId.AnimalFeed),
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