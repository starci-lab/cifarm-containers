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
    HoneycombInfo
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
}
