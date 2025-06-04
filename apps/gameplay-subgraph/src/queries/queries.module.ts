import { Module } from "@nestjs/common"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { ProductsModule } from "./products"
import { InventoryTypesModule } from "./inventory-types"
import { PlacedItemTypesModule } from "./placed-item-types"
import { SuppliesModule  } from "./supplies"
import { SystemsModule } from "./systems"
import { TilesModule } from "./tiles"
import { ToolsModule } from "./tools"
import { UsersModule } from "./users"
import { PetsModule } from "./pets"
import { FruitsModule } from "./fruits"
import { PlacedItemsModule } from "./placed-items"
import { FlowersModule } from "./flowers"
import { InventoriesModule } from "./inventories"
import { NftsModule } from "./nfts"
import { NFTMetadatasModule } from "./nft-metadatas"
import { VaultModule } from "./vault"
import { TerrainsModule } from "./terrains"
import { SeasonsModule } from "./seasons"
@Module({
    imports: [
        AnimalsModule,
        BuildingsModule,
        CropsModule,
        FruitsModule,
        InventoryTypesModule,
        InventoriesModule,
        NftsModule,
        PlacedItemTypesModule,
        SuppliesModule,
        SystemsModule,
        PlacedItemsModule,
        TilesModule,
        ToolsModule,
        TerrainsModule,
        UsersModule,
        PetsModule,
        ProductsModule,
        FlowersModule,
        NFTMetadatasModule,
        SeasonsModule,
        VaultModule
    ]
})
export class QueriesModule {}
