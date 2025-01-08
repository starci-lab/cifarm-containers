import { Injectable, OnModuleInit } from "@nestjs/common";
import { AnimalEntity } from "@src/databases";
import { DataSource } from "typeorm";

@Injectable()
export class SubService implements OnModuleInit {
    constructor(
        private readonly dataSource: DataSource
    ) {
    }
    async onModuleInit() {
        console.log(await this.dataSource.manager.find(AnimalEntity))
    }
}