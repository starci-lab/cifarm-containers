import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, DeepPartial } from "@src/common"
import {
    CropId,
    FlowerId,
    InjectMongoose,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    PlantType,
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
                _id: createObjectId(InventoryTypeId.FruitFertilizer),
                displayId: InventoryTypeId.FruitFertilizer,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                supply: createObjectId(SupplyId.FruitFertilizer),
                type: InventoryType.Supply
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
                _id: createObjectId(InventoryTypeId.Turnip),
                displayId: InventoryTypeId.Turnip,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Turnip),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.TurnipQuality),
                displayId: InventoryTypeId.TurnipQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.TurnipQuality),
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
                _id: createObjectId(InventoryTypeId.Banana),
                displayId: InventoryTypeId.Banana,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Banana),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.BananaQuality),
                displayId: InventoryTypeId.BananaQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.BananaQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Apple),
                displayId: InventoryTypeId.Apple,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Apple),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.AppleQuality),
                displayId: InventoryTypeId.AppleQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.AppleQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.TurnipSeed),
                displayId: InventoryTypeId.TurnipSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                seedType: PlantType.Crop,
                crop: createObjectId(CropId.Turnip),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.CarrotSeed),
                displayId: InventoryTypeId.CarrotSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                seedType: PlantType.Crop,
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
                seedType: PlantType.Crop,
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
                seedType: PlantType.Crop,
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
                seedType: PlantType.Crop,
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
                seedType: PlantType.Crop,
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
                seedType: PlantType.Crop,
                crop: createObjectId(CropId.BellPepper),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.DaisySeed),
                displayId: InventoryTypeId.DaisySeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                seedType: PlantType.Flower,
                flower: createObjectId(FlowerId.Daisy),
                type: InventoryType.Seed
            },
            {
                _id: createObjectId(InventoryTypeId.Daisy),
                displayId: InventoryTypeId.Daisy,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                type: InventoryType.Product,
                product: createObjectId(ProductId.Daisy),
            },
            {
                _id: createObjectId(InventoryTypeId.DaisyQuality),
                displayId: InventoryTypeId.DaisyQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                type: InventoryType.Product,
                product: createObjectId(ProductId.DaisyQuality),
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
            },
            {
                _id: createObjectId(InventoryTypeId.AnimalMedicine),
                displayId: InventoryTypeId.AnimalMedicine,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.AnimalMedicine),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.BugNet),
                displayId: InventoryTypeId.BugNet,
                stackable: false,
                asTool: true,
                deliverable: false,
                placeable: false,
                tool: createObjectId(ToolId.BugNet),
                type: InventoryType.Tool
            },
            {
                _id: createObjectId(InventoryTypeId.Strawberry),
                displayId: InventoryTypeId.Strawberry,
                stackable: true,
                asTool: true,
                deliverable: false,
                placeable: false,
                type: InventoryType.Product,
                product: createObjectId(ProductId.Strawberry)
            },
            {
                _id: createObjectId(InventoryTypeId.StrawberryQuality),
                displayId: InventoryTypeId.StrawberryQuality,
                stackable: true,
                asTool: true,
                deliverable: false,
                placeable: false,
                type: InventoryType.Product,
                product: createObjectId(ProductId.StrawberryQuality)
            },
            {
                _id: createObjectId(InventoryTypeId.StrawberrySeed),
                displayId: InventoryTypeId.StrawberrySeed,
                asTool: true,
                stackable: true,
                deliverable: false,
                placeable: false,
                seedType: PlantType.Crop,
                crop: createObjectId(CropId.Strawberry),
                type: InventoryType.Seed,
                maxStack: 64,
            },
            {
                _id: createObjectId(InventoryTypeId.Honey),
                displayId: InventoryTypeId.Honey,
                asTool: false,
                maxStack: 64,
                deliverable: true,
                placeable: false,
                product: createObjectId(ProductId.Honey),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.HoneyQuality),
                displayId: InventoryTypeId.HoneyQuality,
                asTool: false,
                maxStack: 64,
                deliverable: true,
                placeable: false,
                product: createObjectId(ProductId.HoneyQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.DragonFruit),
                displayId: InventoryTypeId.DragonFruit,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.DragonFruit),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.DragonFruitQuality),
                displayId: InventoryTypeId.DragonFruitQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.DragonFruitQuality),
                type: InventoryType.Product
            },
            {   
                _id: createObjectId(InventoryTypeId.Jackfruit),
                displayId: InventoryTypeId.Jackfruit,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Jackfruit),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.JackfruitQuality),
                displayId: InventoryTypeId.JackfruitQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.JackfruitQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Rambutan),  
                displayId: InventoryTypeId.Rambutan,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Rambutan),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.RambutanQuality),
                displayId: InventoryTypeId.RambutanQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.RambutanQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Pomegranate),
                displayId: InventoryTypeId.Pomegranate,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Pomegranate),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.PomegranateQuality),
                displayId: InventoryTypeId.PomegranateQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.PomegranateQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Pumpkin),
                displayId: InventoryTypeId.Pumpkin,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Pumpkin),
                type: InventoryType.Product
            },  
            {
                _id: createObjectId(InventoryTypeId.Cauliflower),
                displayId: InventoryTypeId.Cauliflower,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Cauliflower),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.CauliflowerQuality),
                displayId: InventoryTypeId.CauliflowerQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.CauliflowerQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Tomato),
                displayId: InventoryTypeId.Tomato,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Tomato),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.TomatoQuality),
                displayId: InventoryTypeId.TomatoQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.TomatoQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Eggplant),
                displayId: InventoryTypeId.Eggplant,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Eggplant),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.EggplantQuality),
                displayId: InventoryTypeId.EggplantQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.EggplantQuality),
                type: InventoryType.Product
            },  
            {
                _id: createObjectId(InventoryTypeId.Pea),
                displayId: InventoryTypeId.Pea,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Pea),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.PeaQuality),
                displayId: InventoryTypeId.PeaQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.PeaQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.Sunflower),
                displayId: InventoryTypeId.Sunflower,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.Sunflower),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.SunflowerQuality),
                displayId: InventoryTypeId.SunflowerQuality,
                asTool: false,
                deliverable: true,
                maxStack: 64,
                placeable: false,
                product: createObjectId(ProductId.SunflowerQuality),
                type: InventoryType.Product
            },
            {
                _id: createObjectId(InventoryTypeId.SunflowerSeed),
                displayId: InventoryTypeId.SunflowerSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                placeable: false,
                seedType: PlantType.Flower,
                type: InventoryType.Seed,
                flower: createObjectId(FlowerId.Sunflower)
            },
            {
                _id: createObjectId(InventoryTypeId.PumpkinSeed),
                displayId: InventoryTypeId.PumpkinSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                seedType: PlantType.Crop,
                placeable: false,
                type: InventoryType.Seed,
                crop: createObjectId(CropId.Pumpkin)
            },
            {
                _id: createObjectId(InventoryTypeId.CauliflowerSeed),
                displayId: InventoryTypeId.CauliflowerSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                seedType: PlantType.Crop,
                placeable: false,
                type: InventoryType.Seed,
                crop: createObjectId(CropId.Cauliflower)
            },
            {
                _id: createObjectId(InventoryTypeId.TomatoSeed),
                displayId: InventoryTypeId.TomatoSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                seedType: PlantType.Crop,
                placeable: false,
                type: InventoryType.Seed,
                crop: createObjectId(CropId.Tomato)
            },
            {
                _id: createObjectId(InventoryTypeId.EggplantSeed),
                displayId: InventoryTypeId.EggplantSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                seedType: PlantType.Crop,
                placeable: false,
                type: InventoryType.Seed,
                crop: createObjectId(CropId.Eggplant)
            },
            {
                _id: createObjectId(InventoryTypeId.PeaSeed),
                displayId: InventoryTypeId.PeaSeed,
                asTool: false,
                deliverable: false,
                maxStack: 64,
                seedType: PlantType.Crop,
                placeable: false,
                type: InventoryType.Seed,
                crop: createObjectId(CropId.Pea)
            }
        ]

        await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping inventory types...")
        await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).deleteMany({})
    }
}