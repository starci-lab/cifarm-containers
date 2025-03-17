import { Module } from "@nestjs/common"
import { StaticService } from "./static.service"

@Module({
    providers: [StaticService],
    exports: [StaticService],
})
export class StaticModule {}
