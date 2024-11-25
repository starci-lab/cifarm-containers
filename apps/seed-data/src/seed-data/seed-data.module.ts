import { Module } from "@nestjs/common"
import { SeedDataService } from "./seed-data.service"

@Module({
    imports: [],
    providers: [SeedDataService]
})
export class SeedDataModule {}
