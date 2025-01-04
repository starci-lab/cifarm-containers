import { Module } from "@nestjs/common"
 
import { AnimalInfosResolver } from "./animal-infos.resolver"
import { AnimalInfosService } from "./animal-infos.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [AnimalInfosService, AnimalInfosResolver]
})
export class AnimalInfosModule {}
