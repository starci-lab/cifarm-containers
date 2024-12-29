import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { SwitchModule } from "./switch"

@Module({
    imports: [ SeedModule, SwitchModule ],
    providers: [],
})
export class DatabaseModule {}