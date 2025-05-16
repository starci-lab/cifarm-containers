import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalInfo,
    CropInfo,
    DailyRewardInfo,
    DefaultInfo,
    EnergyRegen,
    FruitInfo,
    GoldPurchases,
    HoneycombInfo,
    NFTCollections,
    WholesaleMarket,
    BeeHouseInfo,
    FlowerInfo,
    InteractionPermissions,
    NFTBoxInfo,
    Tokens,
    PetInfo
} from "@src/databases"
import { StaticService } from "@src/gameplay"                                           

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    activities(): Activities {
        return this.staticService.activities
    }

    cropInfo(): CropInfo {
        return this.staticService.cropInfo
    }

    animalInfo(): AnimalInfo {
        return this.staticService.animalInfo
    }

    fruitInfo(): FruitInfo {
        return this.staticService.fruitInfo
    }

    defaultInfo(): DefaultInfo {
        return this.staticService.defaultInfo
    }

    energyRegen(): EnergyRegen {
        return this.staticService.energyRegen
    }

    dailyRewardInfo(): DailyRewardInfo {
        return this.staticService.dailyRewardInfo
    }

    honeycombInfo(): HoneycombInfo {
        return this.staticService.honeycombInfo
    }

    nftCollections(): NFTCollections {
        return this.staticService.nftCollections
    }

    wholesaleMarket(): WholesaleMarket {
        return this.staticService.wholesaleMarket
    }
    
    goldPurchases(): GoldPurchases {
        return this.staticService.goldPurchases
    }

    beeHouseInfo(): BeeHouseInfo {
        return this.staticService.beeHouseInfo
    }

    flowerInfo(): FlowerInfo {
        return this.staticService.flowerInfo
    }

    interactionPermissions(): InteractionPermissions {
        return this.staticService.interactionPermissions
    }

    nftBoxInfo(): NFTBoxInfo {
        return this.staticService.nftBoxInfo
    }

    tokens(): Tokens {
        return this.staticService.tokens
    }

    petInfo(): PetInfo {
        return this.staticService.petInfo
    }
}
