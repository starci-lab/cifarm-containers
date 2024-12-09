import { Module } from "@nestjs/common"
import { AppService } from "./app.service"
import {
    cacheRegisterAsync,
    configForRoot,
    TypeOrmDbType,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { SeedDataModule } from "./seed-data"

@Module({
    imports: [
        configForRoot(),
        typeOrmForRoot(),
        typeOrmForRoot(TypeOrmDbType.Test),
        cacheRegisterAsync(),
        SeedDataModule
    ],
    exports: [AppService],
    providers: [AppService]
})
export class AppModule {}
