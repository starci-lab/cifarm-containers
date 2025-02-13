import { Logger } from "@nestjs/common"
import { createObjectId, DeepPartial } from "@src/common"
import {
    AnimalId,
    CropId,
    InjectMongoose,
    ProductKey,
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
                _id: createObjectId(ProductKey.Egg),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Chicken),
            },
            {
                _id: createObjectId(ProductKey.EggQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Chicken),
            },
            {
                _id: createObjectId(ProductKey.Milk),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Cow),
            },
            {
                _id: createObjectId(ProductKey.MilkQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                animal: createObjectId(AnimalId.Cow),
            },
            {
                _id: createObjectId(ProductKey.Carrot),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Carrot),
            },
            {
                _id: createObjectId(ProductKey.Potato),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Potato),
            },
            {
                _id: createObjectId(ProductKey.Cucumber),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Cucumber),
            },
            {
                _id: createObjectId(ProductKey.Pineapple),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Pineapple),
            },
            {
                _id: createObjectId(ProductKey.CarrotQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Carrot),
            },
            {
                _id: createObjectId(ProductKey.PotatoQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Potato),
            },
            {
                _id: createObjectId(ProductKey.CucumberQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Cucumber),
            },
            {
                _id: createObjectId(ProductKey.PineappleQuality),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Pineapple),
            },
            {
                _id: createObjectId(ProductKey.Watermelon),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.Watermelon),
            },
            {
                _id: createObjectId(ProductKey.BellPepper),
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                crop: createObjectId(CropId.BellPepper),
            },
            {
                _id: createObjectId(ProductKey.BellPepperQuality),
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                crop: createObjectId(CropId.BellPepper),
            },
            {
                _id: createObjectId(ProductKey.WatermelonQuality),
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