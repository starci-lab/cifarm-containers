import { Logger } from "@nestjs/common"
import { createObjectId, DeepPartial } from "@src/common"
import {
    AnimalId,
    CropId,
    InjectMongoose,
    ProductId,
    ProductSchema,
    ProductType,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

export class ProductSeeder implements Seeder {
    private readonly logger = new Logger(ProductSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding products...")
        const data: Array<DeepPartial<ProductSchema>> = [
            {
                _id: createObjectId(ProductId.Egg),
                displayId: ProductId.Egg,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Chicken),
            },
            {
                _id: createObjectId(ProductId.EggQuality),
                displayId: ProductId.EggQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Chicken),
            },
            {
                _id: createObjectId(ProductId.Milk),
                displayId: ProductId.Milk,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Cow),
            },
            {
                _id: createObjectId(ProductId.MilkQuality),
                displayId: ProductId.MilkQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Cow),
            },
            {
                _id: createObjectId(ProductId.Carrot),
                displayId: ProductId.Carrot,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Carrot),
            },
            {
                _id: createObjectId(ProductId.Potato),
                displayId: ProductId.Potato,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Potato),
            },
            {
                _id: createObjectId(ProductId.Cucumber),
                displayId: ProductId.Cucumber,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Cucumber),
            },
            {
                _id: createObjectId(ProductId.Pineapple),
                displayId: ProductId.Pineapple,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Pineapple),
            },
            {
                _id: createObjectId(ProductId.CarrotQuality),
                displayId: ProductId.CarrotQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Carrot),
            },
            {
                _id: createObjectId(ProductId.PotatoQuality),
                displayId: ProductId.PotatoQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Potato),
            },
            {
                _id: createObjectId(ProductId.CucumberQuality),
                displayId: ProductId.CucumberQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Cucumber),
            },
            {
                _id: createObjectId(ProductId.PineappleQuality),
                displayId: ProductId.PineappleQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Pineapple),
            },
            {
                _id: createObjectId(ProductId.Watermelon),
                displayId: ProductId.Watermelon,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Watermelon),
            },
            {
                _id: createObjectId(ProductId.BellPepper),
                displayId: ProductId.BellPepper,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.BellPepper),
            },
            {
                _id: createObjectId(ProductId.BellPepperQuality),
                displayId: ProductId.BellPepperQuality,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.BellPepper),
            },
            {
                _id: createObjectId(ProductId.WatermelonQuality),
                displayId: ProductId.WatermelonQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Watermelon),
            }
        ]
        
        await this.connection.model<ProductSchema>(ProductSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping products...")
        await this.connection.model<ProductSchema>(ProductSchema.name).deleteMany({})
    }
}