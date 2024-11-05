import { Module } from "@nestjs/common"
import { DoHealthcheckService } from "./do-healthcheck.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"

@Module({
    imports: [
        TypeOrmModule.forFeature([HealthcheckEntity])
    ],
    controllers: [DoHealthcheckService],
    providers: [],
})
export class DoHealthcheckModule {}