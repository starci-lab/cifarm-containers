import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"

@Module({
    imports: [
        TypeOrmModule.forFeature([HealthcheckEntity])
    ],
    controllers: [GenerateFakeSignatureModule],
    providers: [],
})
export class GenerateFakeSignatureModule {}