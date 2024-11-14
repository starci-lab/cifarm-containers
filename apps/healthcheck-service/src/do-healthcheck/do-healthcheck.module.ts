import { Global, Module } from "@nestjs/common"
import { DoHealthcheckService } from "./do-healthcheck.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([HealthcheckEntity])],
    controllers: [],
    providers: [DoHealthcheckService],
    exports: [DoHealthcheckService]
})
export class DoHealthcheckModule {}
