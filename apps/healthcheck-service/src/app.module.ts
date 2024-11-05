import { Module } from "@nestjs/common"
import { DoHealthcheckService } from "./do-healthcheck"

@Module({
    controllers: [DoHealthcheckService],
})
export class AppModule {}
