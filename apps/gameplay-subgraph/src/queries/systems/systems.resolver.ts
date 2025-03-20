import { Logger } from "@nestjs/common"
import { Query, Resolver } from "@nestjs/graphql"
import { Activities, AnimalInfo, CropInfo, DailyRewardInfo, DefaultInfo, EnergyRegen, FruitInfo, SpinInfo, HoneycombInfo } from "@src/databases"
import { SystemsService } from "./systems.service"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    @Query(() => Activities, {
        name: "activities",
        description: "Get all activities"
    })  
    async activities(): Promise<Activities> {
        return this.systemsService.activities()
    }

    @Query(() => CropInfo, {
        name: "cropInfo",
        description: "Get the crop info"
    })
    async cropInfo(): Promise<CropInfo> {
        return this.systemsService.cropInfo()
    }

    @Query(() => AnimalInfo, {
        name: "animalInfo",
        description: "Get the animal info"
    })
    async animalInfo(): Promise<AnimalInfo> {
        return this.systemsService.animalInfo()
    }

    @Query(() => FruitInfo, {
        name: "fruitInfo",
        description: "Get the fruit info"
    })
    async fruitInfo(): Promise<FruitInfo> {
        return this.systemsService.fruitInfo()
    }

    @Query(() => DefaultInfo, {
        name: "defaultInfo",
        description: "Get the default info"
    })
    async defaultInfo(): Promise<DefaultInfo> {
        return this.systemsService.defaultInfo()
    }

    @Query(() => SpinInfo, {
        name: "spinInfo",
        description: "Get the spin info"
    })
    async spinInfo(): Promise<SpinInfo> {
        return this.systemsService.spinInfo()
    }

    @Query(() => EnergyRegen, {
        name: "energyRegen",
        description: "Get the energy regen"
    })
    async energyRegen(): Promise<EnergyRegen> {
        return this.systemsService.energyRegen()
    }

    @Query(() => DailyRewardInfo, {
        name: "dailyRewardInfo",
        description: "Get the daily reward info"
    })
    async dailyRewardInfo(): Promise<DailyRewardInfo> {
        return this.systemsService.dailyRewardInfo()
    }

    @Query(() => HoneycombInfo, {
        name: "honeycombInfo",
        description: "Get the honeycomb info"
    })
    async honeycombInfo(): Promise<HoneycombInfo> {
        return this.systemsService.honeycombInfo()
    }
}

