import { Logger } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { SystemsService } from "./systems.service"
import { Activities, AnimalRandomness, CropRandomness, EnergyRegenTime, SpinInfo, Starter } from "@src/databases"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    @Query(() => Activities, {
        name: "activities"
    })
    async getActivities(): Promise<Activities> {
        return this.systemsService.getActivities()
    }

    @Query(() => CropRandomness, {
        name: "cropRandomness"
    })
    async getCropRandomness(): Promise<CropRandomness> {
        return this.systemsService.getCropRandomness()
    }

    @Query(() => AnimalRandomness, {
        name: "animalRandomness"
    })
    async getAnimalRandomness(): Promise<AnimalRandomness> {
        return this.systemsService.getAnimalRandomness()
    }

    @Query(() => Starter, {
        name: "starter"
    })
    async getStarter(): Promise<Starter> {
        return this.systemsService.getStarter()
    }

    @Query(() => SpinInfo, {
        name: "spinInfo"
    })
    async getSpinInfo(): Promise<SpinInfo> {
        return this.systemsService.getSpinInfo()
    }

    @Query(() => EnergyRegenTime, {
        name: "energyRegenTime"
    })
    async getEnergyRegenTime(): Promise<EnergyRegenTime> {
        return this.systemsService.getEnergyRegenTime()
    }
}

