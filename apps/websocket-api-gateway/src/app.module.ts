import { PlacedItemsModule } from "./broadcasts"
import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
@Module({
    imports: [
        ScheduleModule.forRoot(),
        PlacedItemsModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
