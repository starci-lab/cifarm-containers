import { Module } from "@nestjs/common"
import { SeedDataService } from "./seed-data.service"

@Module({
    imports: [],
    providers: [SeedDataService],
    exports: [SeedDataService]
})
export class SeedDataModule {}
