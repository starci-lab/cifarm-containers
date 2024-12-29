import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class CliSqliteService {
    constructor(
        private readonly dataSource: DataSource
    ) { }
    public getDataSource(): DataSource {
        return this.dataSource
    }
}