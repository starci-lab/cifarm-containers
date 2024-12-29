import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { SwitchModule } from "./switch"
import { DatabaseCommand } from "./database.command"
import { InitModule } from "./init"

@Module({
    imports: [ SeedModule, SwitchModule, InitModule ],
    providers: [ DatabaseCommand ],
})
export class DatabaseModule {}