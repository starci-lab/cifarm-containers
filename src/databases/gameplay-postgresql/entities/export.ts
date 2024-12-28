import { AbstractEntity } from "./abstract"
import { AnimalInfoEntity } from "./animal-info.entity"
import { AnimalEntity } from "./animal.entity"
import { BuildingInfoEntity } from "./building-info.entity"
import { BuildingEntity } from "./building.entity"
import { CollectionEntity } from "./collection.entity"
import { CropEntity } from "./crop.entity"
import { DailyRewardEntity } from "./daily-reward.entity"
import { DeliveringProductEntity } from "./delivering-product.entity"
import { HealthcheckEntity } from "./healthcheck.entity"
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
import { TempEntity } from "./temp.entity"
import { TileEntity } from "./tile.entity"
import { ToolEntity } from "./tool.entity"
import { UpgradeEntity } from "./upgrade.entity"
import { UserEntity } from "./user.entity"
import { UsersFollowingUsersEntity } from "./users-following-users.entity"

export const gameplayEntites = () : Array<typeof AbstractEntity> => ([
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
    HealthcheckEntity,
    UsersFollowingUsersEntity,
    CollectionEntity,
    SessionEntity,
    TempEntity
])