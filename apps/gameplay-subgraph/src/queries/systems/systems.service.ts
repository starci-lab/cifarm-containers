import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalRandomness,
    CropRandomness,
    DailyRewardInfo,
    DefaultInfo,
    EnergyRegen,
    HoneycombInfo,
    InjectMongoose,
    SpinInfo,
} from "@src/databases"
import { Connection } from "mongoose"
import { StaticService } from "@src/gameplay"                                           

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService
    ) {}

    async getActivities(): Promise<Activities> {
        return this.staticService.activities
    }

    async getCropRandomness(): Promise<CropRandomness> {
        return this.staticService.cropRandomness
    }

    async getAnimalRandomness(): Promise<AnimalRandomness> {
        return this.staticService.animalRandomness
    }

    async getDefaultInfo(): Promise<DefaultInfo> {
        return this.staticService.defaultInfo
    }

    async getSpinInfo(): Promise<SpinInfo> {
        return this.staticService.spinInfo
    }

    async getEnergyRegen(): Promise<EnergyRegen> {
        return this.staticService.energyRegen
    }

    async getDailyRewardInfo(): Promise<DailyRewardInfo> {
        return this.staticService.dailyRewardInfo
    }

    async getHoneycombInfo(): Promise<HoneycombInfo> {
        return this.staticService.honeycombInfo
    }
}
