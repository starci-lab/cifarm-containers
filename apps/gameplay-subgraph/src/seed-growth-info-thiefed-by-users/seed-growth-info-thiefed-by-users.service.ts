import { Injectable, Logger, Inject } from "@nestjs/common"
import { DataSource } from "typeorm"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class SeedGrowthInfoThiefedByUsersService {
    private readonly logger = new Logger(SeedGrowthInfoThiefedByUsersService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

}
