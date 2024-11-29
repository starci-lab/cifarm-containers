// import { GetAnimalInfoThiefedByUsersArgs } from "@apps/static-subgraph/src/animal-info-thiefed-by-users/animal-info-thiefed-by-users.dto"
import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class AnimalInfoThievedByUsersService {
    private readonly logger = new Logger(AnimalInfoThievedByUsersService.name)

    constructor(private readonly dataSource: DataSource) {}

    // async getAnimalInfoThiefedByUsers({ limit = 10, offset = 0 }: GetAnimalInfoThiefedByUsersArgs): Promise<Array<AnimalInfoThiefedByUserEntity>> {
    //     this.logger.debug(`GetAnimalInfoThiefedByUsers: limit=${limit}, offset=${offset}`)

    //     let animalInfoThiefedByUsers: Array<AnimalInfoThiefedByUserEntity>
    //     const queryRunner = this.dataSource.createQueryRunner()
    //     await queryRunner.connect()
    //     try {
    //         animalInfoThiefedByUsers = await this.dataSource.getRepository(AnimalInfoThiefedByUserEntity).find({
    //             take: limit,
    //             skip: offset
    //         })
    //     } finally {
    //         await queryRunner.release()
    //     }
    //     return animalInfoThiefedByUsers
    // }
}
