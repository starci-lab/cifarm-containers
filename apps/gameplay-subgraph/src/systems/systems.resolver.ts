import { Logger } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { SystemsService } from "./systems.service"
import { Activities, AnimalRandomness, CropRandomness, EnergyRegen, SpinInfo, DefaultInfo } from "@src/databases"

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

    @Query(() => DefaultInfo, {
        name: "starter"
    })
    async getDefaultInfo(): Promise<DefaultInfo> {
        return this.systemsService.getDefaultInfo()
    }

    @Query(() => SpinInfo, {
        name: "spinInfo"
    })
    async getSpinInfo(): Promise<SpinInfo> {
        return this.systemsService.getSpinInfo()
    }

    @Query(() => EnergyRegen, {
        name: "energyRegen"
    })
    async getEnergyRegen(): Promise<EnergyRegen> {
        return this.systemsService.getEnergyRegen()
    }
}

