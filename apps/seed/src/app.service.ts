import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { SeedDataService } from "@src/services"
import { DataSource } from "typeorm"

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger = new Logger(AppService.name)

    constructor(
        @InjectDataSource("main")
        private readonly dataSourceMain: DataSource,
        @InjectDataSource("test")
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
