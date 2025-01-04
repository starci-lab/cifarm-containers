import { Module } from "@nestjs/common"
import { AnimalsResolver } from "./animals.resolver"
import { AnimalsService } from "./animals.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forRoot()],
    providers: [AnimalsService, AnimalsResolver]
})
export class AnimalsModule {}
