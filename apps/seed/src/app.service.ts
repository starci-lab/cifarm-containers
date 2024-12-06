import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { TEST_NAME } from "@src/dynamic-modules"
import { DataSource } from "typeorm"
import { SeedDataService } from "./seed-data"

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger = new Logger(AppService.name)

    constructor(
        private readonly dataSourceMain: DataSource,
        @InjectDataSource(TEST_NAME)
        private readonly dataSourceTest: DataSource,
        private readonly seedDataService: SeedDataService
    ) {}

    async onModuleInit() {
        this.logger.debug("SeedStaticData initialized")
        this.logger.debug(this.dataSourceMain, this.dataSourceTest)
        Promise.all([
            await this.seedDataService.seed(this.dataSourceMain),
            await this.seedDataService.seed(this.dataSourceTest)
        ])
        this.logger.debug("SeedStaticData finished")
    }
}
