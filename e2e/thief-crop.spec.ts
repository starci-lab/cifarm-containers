//npx jest --config ./e2e/jest.json ./e2e/thief-crop.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import { sleep } from "@src/common"
import {
    CropCurrentState,
    CropEntity,
    CropId,
    GameplayPostgreSQLModule,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    PlacedItemType,
    ProductType,
    SeedGrowthInfoEntity,
    TileId,
    UserEntity,
} from "@src/databases"
import { grpcData, GrpcModule, GrpcServiceName } from "@src/grpc"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { AxiosConfigType, createAxios } from "./e2e.utils"
import { Network, SupportedChainKey } from "@src/blockchain"
import { EnvModule } from "@src/env"

describe("Thief crop flow", () => {
    let user: UserLike
    let accessToken: string

    let thiefUser: UserLike
    let thiefAccessToken: string

    let dataSource: DataSource
    let jwtService: JwtService
    let gameplayService: IGameplayService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EnvModule.forRoot(),
                GameplayPostgreSQLModule.forRoot(),
                GrpcModule.forRoot({
                    name: GrpcServiceName.Gameplay,
                }),
                JwtModule,
            ],
        }).compile()

        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcServiceName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(grpcData[GrpcServiceName.Gameplay].service)

        // Sign in as main user
        const authAxios = createAxios(AxiosConfigType.NoAuth, { version: "v1" })
        const { data } = await authAxios.post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet,
        })
        const { data: verifySignatureData } = await authAxios.post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        user = await jwtService.decodeToken(accessToken)

        // Sign in as thief
        const { data: thiefData } = await authAxios.post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 2,
            network: Network.Testnet,
        })
        const { data: verifyThiefSignatureData } = await authAxios.post("/verify-signature", thiefData)

        thiefAccessToken = verifyThiefSignatureData.accessToken
        thiefUser = await jwtService.decodeToken(thiefAccessToken)
    })

    it("Should thief crop successfully", async () => {
        const cropId: CropId = CropId.Carrot

        const axios = createAxios(AxiosConfigType.WithAuth, { version: "v1", accessToken })

        // Buy seeds and plant the crop
        await axios.post("/buy-seeds", { cropId, quantity: 1 })

        const { id: inventorySeedId } = await dataSource.manager.findOne(InventoryEntity, {
            where: { userId: user.id, inventoryType: { type: InventoryType.Seed, cropId } },
            relations: { inventoryType: true },
        })

        const { id: placedItemTileId } = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { userId: user.id, placedItemType: { tile: { id: TileId.StarterTile }, type: PlacedItemType.Tile } },
            relations: { placedItemType: { tile: true } },
        })

        await axios.post("/plant-seed", { inventorySeedId, placedItemTileId })

        const crop = await dataSource.manager.findOne(CropEntity, { where: { id: cropId } })

        // Speed up growth to harvestable stage
        for (let stage = 2; stage <= crop.growthStages; stage++) {
            await lastValueFrom(gameplayService.speedUp({ time: crop.growthStageDuration }))
            await sleep(2000)

            const seedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: { placedItemId: placedItemTileId },
            })

            if (seedGrowthInfo.currentState === CropCurrentState.NeedWater) {
                await axios.post("/water", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsWeedy) {
                await axios.post("/use-herbicide", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsInfested) {
                await axios.post("/use-pesticide", { placedItemTileId })
            }
        }

        // Crop should be fully matured
        const fullyMaturedInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { placedItemId: placedItemTileId },
        })
        expect(fullyMaturedInfo.currentState).toBe(CropCurrentState.FullyMatured)

        // Thief steals the crop
        const thiefAxios = createAxios(AxiosConfigType.WithAuth, { version: "v1", accessToken: thiefAccessToken })
        const { data: thiefCropResponseData } = await thiefAxios.post("/thief-crop", {
            placedItemTileId,
            neighborUserId: user.id,
        })

        // Check thief's inventory
        const thiefInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: thiefUser.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: { type: ProductType.Crop, cropId },
                },
            },
        })
        expect(thiefInventory.quantity).toBe(thiefCropResponseData.quantity)
    })

    afterAll(async () => {
        await dataSource.manager.delete(UserEntity, user.id)
        await dataSource.manager.delete(UserEntity, thiefUser.id)
    })
})
