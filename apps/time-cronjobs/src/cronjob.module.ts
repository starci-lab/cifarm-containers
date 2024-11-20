import { Module } from "@nestjs/common"
import { CronjobController } from "./cronjob.controller"
import { CronjobService } from "./cronjob.service"
import { CropsService } from "./crops/crops.service"
import { ScheduleModule } from "@nestjs/schedule"

@Module({
    imports: [
        ScheduleModule.forRoot()
    ],
    controllers: [CronjobController],
    providers: [CropsService, CronjobService]
})
export class CronjobModule {}
