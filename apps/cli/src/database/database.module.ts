import { Module } from "@nestjs/common"
import { SeedModule } from "./seed"
import { DatabaseCommand } from "./database.command"

@Module({
    imports: [ SeedModule ],
    providers: [ DatabaseCommand ],
})
export class DatabaseModule {}