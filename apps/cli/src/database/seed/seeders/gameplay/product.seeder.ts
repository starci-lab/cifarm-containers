import { Logger } from "@nestjs/common"
import { DeepPartial } from "@src/common"
import {
    AnimalKey,
    CropKey,
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
                key: ProductKey.Egg,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                refKey: AnimalKey.Chicken
            },
            {
                key: ProductKey.EggQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                refKey: AnimalKey.Chicken,
            },
            {
                key: ProductKey.Milk,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Animal,
                refKey: AnimalKey.Cow,
            },
            {
                key: ProductKey.MilkQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Animal,
                refKey: AnimalKey.Cow,
            },
            {
                key: ProductKey.Carrot,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                refKey: CropKey.Carrot,
            },
            {
                key: ProductKey.Potato,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                refKey: CropKey.Potato,
            },
            {
                key: ProductKey.Cucumber,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                refKey: CropKey.Cucumber,
            },
            {
                key: ProductKey.Pineapple,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                refKey: CropKey.Pineapple,
            },
            {
                key: ProductKey.CarrotQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                refKey: CropKey.Carrot,
            },
            {
                key: ProductKey.PotatoQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                refKey: CropKey.Potato,
            },
            {
                key: ProductKey.CucumberQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                refKey: CropKey.Cucumber,
            },
            {
                key: ProductKey.PineappleQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                refKey: CropKey.Pineapple,
            },
            {
                key: ProductKey.Watermelon,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                refKey: CropKey.Watermelon,
            },
            {
                key: ProductKey.WatermelonQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                refKey: CropKey.Watermelon,
            },
            {
                key: ProductKey.BellPepper,
                maxStack: 64,
                isQuality: false,
                goldAmount: 5,
                type: ProductType.Crop,
                refKey: CropKey.BellPepper,
            },
            {
                key: ProductKey.BellPepperQuality,
                maxStack: 64,
                isQuality: true,
                goldAmount: 5,
                tokenAmount: 1,
                type: ProductType.Crop,
                refKey: CropKey.BellPepper,
            }
        ]
        
        await this.connection.model<ProductSchema>(ProductSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping products...")
        await this.connection.model<ProductSchema>(ProductSchema.name).deleteMany({})
    }
}