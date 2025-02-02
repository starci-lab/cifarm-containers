import { AbstractEntity } from "./abstract"
import { AnimalInfoEntity } from "./animal-info.entity"
import { AnimalEntity } from "./animal.entity"
import { BuildingInfoEntity } from "./building-info.entity"
import { BuildingEntity } from "./building.entity"
import { CollectionEntity } from "./collection.entity"
import { CropEntity } from "./crop.entity"
import { DailyRewardEntity } from "./daily-reward.entity"
import { DeliveringProductEntity } from "./delivering-product.entity"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { InventoryEntity } from "./inventory.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { ProductEntity } from "./product.entity"
import { SeedGrowthInfoEntity } from "./seed-grow-info.entity"
import { SessionEntity } from "./session.entity"
import { SpinPrizeEntity } from "./spin-prize.entity"
import { SpinSlotEntity } from "./spin-slot.entity"
import { SupplyEntity } from "./supply.entity"
import { SystemEntity } from "./system.entity"
import { KeyValueStoreEntity } from "./key-value-store.entity"
import { TileEntity } from "./tile.entity"
import { ToolEntity } from "./tool.entity"
import { UpgradeEntity } from "./upgrade.entity"
import { UserEntity } from "./user.entity"
import { UsersFollowingUsersEntity } from "./users-following-users.entity"
import { TileInfoEntity } from "./tile-info.entity"

export * from "./animal-info.entity"
export * from "./animal.entity"
export * from "./building-info.entity"
export * from "./building.entity"
export * from "./crop.entity"
export * from "./daily-reward.entity"
export * from "./delivering-product.entity"
export * from "./inventory-type.entity"
export * from "./inventory.entity"
export * from "./placed-item-type.entity"
export * from "./placed-item.entity"
export * from "./product.entity"
export * from "./seed-grow-info.entity"
export * from "./spin-slot.entity"
export * from "./spin-prize.entity"
export * from "./supply.entity"
export * from "./system.entity"
export * from "./tile.entity"
export * from "./tool.entity"
export * from "./upgrade.entity"
export * from "./user.entity"
export * from "./session.entity"
export * from "./key-value-store.entity"
export * from "./users-following-users.entity"
export * from "./collection.entity"
export * from "./tile-info.entity"

export const gameplayPostgreSqlEntities = () : Array<typeof AbstractEntity> => ([
    InventoryEntity,
    PlacedItemEntity,
    UserEntity,
    ProductEntity,
    AnimalEntity,
    CropEntity,
    ToolEntity,
    BuildingEntity,
    UpgradeEntity,
    TileEntity,
    SupplyEntity,
    DailyRewardEntity,
    SpinSlotEntity,
    AnimalInfoEntity,
    BuildingInfoEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    InventoryTypeEntity,
    PlacedItemTypeEntity,
    DeliveringProductEntity,
    SpinPrizeEntity,
    SpinSlotEntity,
    AnimalInfoEntity,
    BuildingInfoEntity,
    UsersFollowingUsersEntity,
    CollectionEntity,
    SessionEntity,
    KeyValueStoreEntity,
    TileInfoEntity
])
