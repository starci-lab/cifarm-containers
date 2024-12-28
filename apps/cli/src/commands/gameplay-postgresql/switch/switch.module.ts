import { Module } from "@nestjs/common"
import { SeedCommand } from "./switch.command"

@Module({
    providers: [ SeedCommand ],
    exports: [ SeedCommand ]
})
export class SeedModule {
}
