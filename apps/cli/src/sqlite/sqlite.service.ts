import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class SqliteService {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    public getDataSource() {
        return this.dataSource
    }

    public async destroyDataSource() {
        await this.dataSource.destroy()
    }
}