import { Injectable, Logger } from "@nestjs/common"
import { SpinEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSpinsArgs } from "./spins.dto"

@Injectable()
export class SpinsService {
    private readonly logger = new Logger(SpinsService.name)

    constructor(private readonly dataSource: DataSource) {}
    
    async getSpins({
        limit = 10,
        offset = 0,
    }: GetSpinsArgs): Promise<Array<SpinEntity>> {
        this.logger.debug(`GetSpins: limit=${limit}, offset=${offset}`)
        return this.dataSource.manager.find(SpinEntity, {
            take: limit,
            skip: offset,
        })
    }
}
