import { Module } from "@nestjs/common"
import { AnimalInfoThievedByUsersResolver } from "./animal-info-thieved-by-users.resolver"
import { AnimalInfoThievedByUsersService } from "./animal-info-thieved-by-users.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot()
    ],
    providers: [
        AnimalInfoThievedByUsersService, 
        AnimalInfoThievedByUsersResolver
    ]
})
export class AnimalInfoThievedByUsersModule {}
