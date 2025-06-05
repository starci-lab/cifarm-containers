
import {
    InjectMongoose,
    SeasonSchema,
    SeasonId,
    ProductId,
    TokenKey
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { createObjectId, DeepPartial } from "@src/common"

@Injectable()
export class SeasonSeeder implements Seeder {
    private readonly logger = new Logger(SeasonSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding seasons...")
        const data: Array<DeepPartial<SeasonSchema>> = [
            {
                _id: createObjectId(SeasonId.Season1),
                displayId: SeasonId.Season1,
                // from 7-6-2025 to 7-6-2026
                startDate: new Date("2025-07-06"),
                endDate: new Date("2026-07-06"),
                name: "Golden Sprout Festival",
                description: "A vibrant celebration marking the height of the harvest season. During this time, farmers and adventurers alike gather to honor growth, prosperity, and community. Fields shimmer with golden crops, village squares come alive with music and feasts, and special seasonal challenges await those seeking fortune and festivity.",
                active: true,
                bulks: [
                    {
                        bulkName: "Greeting Bulk",
                        description: "A bulk of products for the greeting season",
                        products: [
                            {
                                productId: createObjectId(ProductId.Apple),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.Banana),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.Tomato),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.Eggplant),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.Milk),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.Egg),
                                quantity: 20,
                            },
                        ],
                        maxPaidAmount: 0.5,
                        maxPaidPercentage: 0.005,
                        tokenKey: TokenKey.USDC,
                        tCIFARM: 5
                    },
                    {
                        bulkName: "Season NFTs Bulk",
                        description: "A bulk of products for the season",
                        products: [
                            {
                                productId: createObjectId(ProductId.DragonFruitQuality),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.JackfruitQuality),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.RambutanQuality),
                                quantity: 20,
                            },
                            {
                                productId: createObjectId(ProductId.PomegranateQuality),
                                quantity: 20,
                            },
                        ],
                        maxPaidAmount: 5,
                        maxPaidPercentage: 0.05,
                        tokenKey: TokenKey.USDC,
                        tCIFARM: 50
                    },
                ]

            }, 
        ]
        await this.connection.model<SeasonSchema>(SeasonSchema.name).insertMany(data)
    }
        
    async drop(): Promise<void> {
        this.logger.verbose("Dropping seasons...")
        await this.connection.model<SeasonSchema>(SeasonSchema.name).deleteMany({})
    }
}
