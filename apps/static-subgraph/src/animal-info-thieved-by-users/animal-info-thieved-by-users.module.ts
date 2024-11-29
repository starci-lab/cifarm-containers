import { AnimalInfoThievedByUsersResolver } from "@apps/static-subgraph/src/animal-info-thieved-by-users/animal-info-thieved-by-users.resolver"
import { AnimalInfoThievedByUsersService } from "@apps/static-subgraph/src/animal-info-thieved-by-users/animal-info-thieved-by-users.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [AnimalInfoThievedByUsersService, AnimalInfoThievedByUsersResolver]
})
export class AnimalInfoThievedByUsersModule {}
