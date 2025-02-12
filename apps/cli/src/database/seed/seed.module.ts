import { Module } from "@nestjs/common"
import { SeedCommand } from "./seed.command"
import { SeedersModule } from "./seeders"

@Module({
    imports: [
        SeedersModule.register()
    ],
    providers: [SeedCommand]
})
export class SeedModule {}
