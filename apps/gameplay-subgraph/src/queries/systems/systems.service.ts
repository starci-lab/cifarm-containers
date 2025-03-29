import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalInfo,
    CropInfo,
    DailyRewardInfo,
    DefaultInfo,
    EnergyRegen,
    FruitInfo,
    HoneycombInfo,
    InjectMongoose,
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

    async activities(): Promise<Activities> {
        return this.staticService.activities
    }

    async cropInfo(): Promise<CropInfo> {
        return this.staticService.cropInfo
    }

    async animalInfo(): Promise<AnimalInfo> {
        return this.staticService.animalInfo
    }

    async fruitInfo(): Promise<FruitInfo> {
        return this.staticService.fruitInfo
    }

    async defaultInfo(): Promise<DefaultInfo> {
        return this.staticService.defaultInfo
    }

    async energyRegen(): Promise<EnergyRegen> {
        return this.staticService.energyRegen
    }

    async dailyRewardInfo(): Promise<DailyRewardInfo> {
        return this.staticService.dailyRewardInfo
    }

    async honeycombInfo(): Promise<HoneycombInfo> {
        return this.staticService.honeycombInfo
    }
}
