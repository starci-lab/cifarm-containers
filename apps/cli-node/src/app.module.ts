import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { configForRoot } from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        SeedModule.forRootAsync()
    ]
})
export class AppModule {}