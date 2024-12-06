import { ScheduleModule } from "@nestjs/schedule"

export const schedulerForRoot = () => {
    return ScheduleModule.forRoot()
}