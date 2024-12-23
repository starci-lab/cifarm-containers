import { Module } from "@nestjs/common"
import { GameplayModule } from "./gameplay"

@Module({
    imports: [ GameplayModule ],
    providers: [],
})
export class CommandsModule {}