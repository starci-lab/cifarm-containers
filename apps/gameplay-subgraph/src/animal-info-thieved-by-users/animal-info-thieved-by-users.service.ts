// import { GetAnimalInfoThiefedByUsersArgs } from "./"
import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class AnimalInfoThievedByUsersService {
    private readonly logger = new Logger(AnimalInfoThievedByUsersService.name)

    constructor(private readonly dataSource: DataSource) {}

}
