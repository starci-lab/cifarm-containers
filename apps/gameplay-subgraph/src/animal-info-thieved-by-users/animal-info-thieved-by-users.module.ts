import { Module } from "@nestjs/common"
import { AnimalInfoThievedByUsersResolver } from "./animal-info-thieved-by-users.resolver"
import { AnimalInfoThievedByUsersService } from "./animal-info-thieved-by-users.service"

@Module({
    providers: [AnimalInfoThievedByUsersService, AnimalInfoThievedByUsersResolver]
})
export class AnimalInfoThievedByUsersModule {}
