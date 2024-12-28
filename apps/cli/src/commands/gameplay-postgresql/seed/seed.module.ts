import { Module } from "@nestjs/common"
import { SeedCommand } from "./seed.command"

@Module({
    providers: [ SeedCommand ],
    exports: [ SeedCommand ]
})
export class SeedModule {
}
