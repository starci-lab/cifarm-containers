import { AnimalInfoThievedByUsersResolver } from "./animal-info-thieved-by-users.resolver"
import { AnimalInfoThievedByUsersService } from "./animal-info-thieved-by-users.service"
import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [AnimalInfoThievedByUsersService, AnimalInfoThievedByUsersResolver]
})
export class AnimalInfoThievedByUsersModule {}
