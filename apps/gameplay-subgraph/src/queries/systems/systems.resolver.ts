import { Logger } from "@nestjs/common"
import { Query, Resolver } from "@nestjs/graphql"
import { Activities, AnimalRandomness, CropRandomness, DailyRewardInfo, DefaultInfo, EnergyRegen, SpinInfo } from "@src/databases"
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
        return this.systemsService.getActivities()
    }

    @Query(() => CropRandomness, {
        name: "cropRandomness",
        description: "Get the crop randomness"
    })
    async cropRandomness(): Promise<CropRandomness> {
        return this.systemsService.getCropRandomness()
    }

    @Query(() => AnimalRandomness, {
        name: "animalRandomness",
        description: "Get the animal randomness"
    })
    async animalRandomness(): Promise<AnimalRandomness> {
        return this.systemsService.getAnimalRandomness()
    }

    @Query(() => DefaultInfo, {
        name: "defaultInfo",
        description: "Get the default info"
    })
    async defaultInfo(): Promise<DefaultInfo> {
        return this.systemsService.getDefaultInfo()
    }

    @Query(() => SpinInfo, {
        name: "spinInfo",
        description: "Get the spin info"
    })
    async spinInfo(): Promise<SpinInfo> {
        return this.systemsService.getSpinInfo()
    }

    @Query(() => EnergyRegen, {
        name: "energyRegen",
        description: "Get the energy regen"
    })
    async energyRegen(): Promise<EnergyRegen> {
        return this.systemsService.getEnergyRegen()
    }

    @Query(() => DailyRewardInfo, {
        name: "dailyRewardInfo",
        description: "Get the daily reward info"
    })
    async dailyRewardInfo(): Promise<DailyRewardInfo> {
        return this.systemsService.getDailyRewardInfo()
    }
}

