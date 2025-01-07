import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class GameplayPostgreSQLService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    public getDataSource(): DataSource {
        return this.dataSource
    }
}