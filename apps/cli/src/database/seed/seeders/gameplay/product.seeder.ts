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
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Chicken),
            },
            {
                _id: createObjectId(ProductId.EggQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Chicken),
            },
            {
                _id: createObjectId(ProductId.Milk),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Cow),
            },
            {
                _id: createObjectId(ProductId.MilkQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Cow),
            },
            {
                _id: createObjectId(ProductId.Carrot),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Carrot),
            },
            {
                _id: createObjectId(ProductId.Potato),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Potato),
            },
            {
                _id: createObjectId(ProductId.Cucumber),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Cucumber),
            },
            {
                _id: createObjectId(ProductId.Pineapple),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Pineapple),
            },
            {
                _id: createObjectId(ProductId.CarrotQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Carrot),
            },
            {
                _id: createObjectId(ProductId.PotatoQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Potato),
            },
            {
                _id: createObjectId(ProductId.CucumberQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Cucumber),
            },
            {
                _id: createObjectId(ProductId.PineappleQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Pineapple),
            },
            {
                _id: createObjectId(ProductId.Watermelon),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Watermelon),
            },
            {
                _id: createObjectId(ProductId.BellPepper),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.BellPepper),
            },
            {
                _id: createObjectId(ProductId.BellPepperQuality),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.BellPepper),
            },
            {
                _id: createObjectId(ProductId.WatermelonQuality),
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