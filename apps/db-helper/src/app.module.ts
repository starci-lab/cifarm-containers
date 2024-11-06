import { Module } from "@nestjs/common"
import { typeOrmGameplayPostgresqlModule } from "@src/modules"

@Module({
    imports: [
        typeOrmGameplayPostgresqlModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
