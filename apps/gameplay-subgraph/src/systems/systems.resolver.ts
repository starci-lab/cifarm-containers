import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { SystemsService } from "./systems.service"
import { Activities, AnimalRandomness, CropRandomness, EnergyRegenTime, SpinInfo, Starter } from "@src/databases"
import { GraphQLCacheInterceptor } from "@src/cache"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => Activities, {
        name: "activities"
    })
    async getActivities(): Promise<Activities> {
        return this.systemsService.getActivities()
    }

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => CropRandomness, {
        name: "cropRandomness"
    })
    async getCropRandomness(): Promise<CropRandomness> {
        return this.systemsService.getCropRandomness()
    }

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => AnimalRandomness, {
        name: "animalRandomness"
    })
    async getAnimalRandomness(): Promise<AnimalRandomness> {
        return this.systemsService.getAnimalRandomness()
    }

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => Starter, {
        name: "starter"
    })
    async getStarter(): Promise<Starter> {
        return this.systemsService.getStarter()
    }

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => SpinInfo, {
        name: "spinInfo"
    })
    async getSpinInfo(): Promise<SpinInfo> {
        return this.systemsService.getSpinInfo()
    }

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => EnergyRegenTime, {
        name: "energyRegenTime"
    })
    async getEnergyRegenTime(): Promise<EnergyRegenTime> {
        return this.systemsService.getEnergyRegenTime()
    }
}

