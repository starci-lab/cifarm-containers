import { Logger, UseGuards } from "@nestjs/common"
import { Query, Resolver } from "@nestjs/graphql"
import {
    Activities,
    AnimalInfo,
    CropInfo,
    DailyRewardInfo,
    DefaultInfo,
    EnergyRegen,
    FruitInfo,
    HoneycombInfo,
    NFTCollections,
    WholesaleMarket,
    GoldPurchases,
    BeeHouseInfo,
    FlowerInfo,
    InteractionPermissions,
    NFTBoxInfo,
    Tokens,
    PetInfo,
    Referral
} from "@src/databases"
import { SystemsService } from "./systems.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => Activities, {
        name: "activities",
        description: "Get all activities"
    })
    activities(): Activities {
        return this.systemsService.activities()
    }
    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => CropInfo, {
        name: "cropInfo",
        description: "Get the crop info"
    })
    cropInfo(): CropInfo {
        return this.systemsService.cropInfo()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => AnimalInfo, {
        name: "animalInfo",
        description: "Get the animal info"
    })
    animalInfo(): AnimalInfo {
        return this.systemsService.animalInfo()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => FruitInfo, {
        name: "fruitInfo",
        description: "Get the fruit info"
    })
    fruitInfo(): FruitInfo {
        return this.systemsService.fruitInfo()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => DefaultInfo, {
        name: "defaultInfo",
        description: "Get the default info"
    })
    defaultInfo(): DefaultInfo {
        return this.systemsService.defaultInfo()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => EnergyRegen, {
        name: "energyRegen",
        description: "Get the energy regen"
    })
    energyRegen(): EnergyRegen {
        return this.systemsService.energyRegen()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => DailyRewardInfo, {
        name: "dailyRewardInfo",
        description: "Get the daily reward info"
    })
    dailyRewardInfo(): DailyRewardInfo {
        return this.systemsService.dailyRewardInfo()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => HoneycombInfo, {
        name: "honeycombInfo",
        description: "Get the honeycomb info"
    })
    honeycombInfo(): HoneycombInfo {
        return this.systemsService.honeycombInfo()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => NFTCollections, {
        name: "nftCollections",
        description: "Get the nft collections"
    })
    nftCollections(): NFTCollections {
        return this.systemsService.nftCollections()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => WholesaleMarket, {
        name: "wholesaleMarket",
        description: "Get the wholesale market"
    })
    wholesaleMarket(): WholesaleMarket {
        return this.systemsService.wholesaleMarket()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => GoldPurchases, {
        name: "goldPurchases",
        description: "Get the gold purchases"
    })
    goldPurchases(): GoldPurchases {
        return this.systemsService.goldPurchases()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => BeeHouseInfo, {
        name: "beeHouseInfo",
        description: "Get the bee house info"
    })
    beeHouseInfo(): BeeHouseInfo {
        return this.systemsService.beeHouseInfo()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => FlowerInfo, {
        name: "flowerInfo",
        description: "Get the flower info"
    })
    flowerInfo(): FlowerInfo {
        return this.systemsService.flowerInfo()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => InteractionPermissions, {
        name: "interactionPermissions",
        description: "Get the interaction permissions"
    })
    interactionPermissions(): InteractionPermissions {
        return this.systemsService.interactionPermissions()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => NFTBoxInfo, {
        name: "nftBoxInfo",
        description: "Get the nft box info"
    })
    nftBoxInfo(): NFTBoxInfo {
        return this.systemsService.nftBoxInfo()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => Tokens, {
        name: "tokens",
        description: "Get the tokens"
    })
    tokens(): Tokens {
        return this.systemsService.tokens()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => PetInfo, {
        name: "petInfo",
        description: "Get the pet info"
    })
    petInfo(): PetInfo {
        return this.systemsService.petInfo()
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => Referral, {
        name: "referral",
        description: "Get the referral"
    })
    referral(): Referral {
        return this.systemsService.referral()
    }
}
