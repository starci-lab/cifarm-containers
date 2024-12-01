import { Module } from "@nestjs/common"
import { SeedDataService } from "./seed-data.service"
import { TypeOrmDbType, typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature(), typeOrmForFeature(TypeOrmDbType.Test)],
    providers: [SeedDataService],
    exports: [SeedDataService]
})
export class SeedDataModule {}
