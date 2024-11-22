import { join } from "path"

export const staticGrpcConstants = {
    NAME: "STATIC_PACKAGE",
    SERVICE: "StaticService",
    PACKAGE: "static",
    PROTO_PATH: join(process.cwd(), "proto", "static/entry.proto")
}

export enum EntityCacheKey {
    Tiles = "tiles",
    Animals = "animals",
    Crops = "crops",
    Tools = "tools",
    Buildings = "buildings",
    DailyRewards = "dailyRewards",
    Spins = "spins",
    Supplies = "supplies",
    Product = "product",
    System = "system"
}
