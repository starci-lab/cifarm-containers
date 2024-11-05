import { Module } from "@nestjs/common"
import { HealthcheckModule } from "./healthcheck"

@Module({
    imports: [HealthcheckModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
