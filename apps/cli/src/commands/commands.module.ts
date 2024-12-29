import { Module } from "@nestjs/common"
import { DatabaseModule } from "./database"

@Module({
    imports: [ DatabaseModule ],
    providers: [],
})
export class CommandsModule {}