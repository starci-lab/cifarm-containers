//npx jest --config ./e2e/jest.json ./e2e/thief-crop.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiVersion, AxiosType, getAxiosToken } from "@src/axios"
import { sleep } from "@src/common"
import {
    CropId,
    UserEntity
} from "@src/databases"
import { CropCurrentState, CropEntity, getPostgreSqlToken, InventoryEntity, InventoryType, PlacedItemEntity, PlacedItemType, ProductType, SeedGrowthInfoEntity, TileId } from "@src/databases/postgresql"
import { Network, SupportedChainKey } from "@src/env"
import { grpcData, GrpcModule, GrpcServiceName } from "@src/grpc"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { createTestModule, MOCK_DATABASE_OPTIONS, TestingModule } from "@src/testing"
import { AxiosInstance } from "axios"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"

describe("Thief crop flow", () => {
    let user: UserLike
    let accessToken: string

    let thiefUser: UserLike
    let thiefAccessToken: string

    let dataSource: DataSource
    let jwtService: JwtService
    let gameplayService: IGameplayService
    
    let axiosWithAuthInstance: AxiosInstance
    let axiosWithNoAuthInstance: AxiosInstance

    beforeAll(async () => {
        const { module } = await createTestModule({
            imports: [
                TestingModule.register({
                    imports: [
                        GrpcModule.register({
                            name: GrpcServiceName.Gameplay,
                        }),
                        JwtModule
                    ]
                })
            ],
        })

        dataSource = module.get<DataSource>(getPostgreSqlToken(MOCK_DATABASE_OPTIONS))

        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcServiceName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(grpcData[GrpcServiceName.Gameplay].service)
        axiosWithAuthInstance = module.get<AxiosInstance>(getAxiosToken({
            type: AxiosType.AxiosWithAuth
        }))
        axiosWithNoAuthInstance = module.get<AxiosInstance>(getAxiosToken({
            type: AxiosType.AxiosWithNoAuth
        }))

        const { data } = await axiosWithNoAuthInstance.post("/generate-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet,
        })

        const { data: verifySignatureData } = await axiosWithNoAuthInstance.post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        user = await jwtService.decodeToken(accessToken)

        const { data: thiefData } = await axiosWithNoAuthInstance.post("/generate-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 2,
            network: Network.Testnet,
        })

        const { data: thiefVerifySignatureData } = await axiosWithNoAuthInstance.post("/verify-signature", thiefData)

        thiefAccessToken = thiefVerifySignatureData.accessToken
        thiefUser = await jwtService.decodeToken(thiefAccessToken)
    })

    it("Should thief crop successfully", async () => {
        const cropId: CropId = CropId.Carrot

        // Buy seeds and plant the crop
        await axiosWithAuthInstance.post("/buy-seeds", { cropId, quantity: 1 })

        const { id: inventorySeedId } = await dataSource.manager.findOne(InventoryEntity, {
            where: { userId: user.id, inventoryType: { type: InventoryType.Seed, cropId } },
            relations: { inventoryType: true },
        })

        const { id: placedItemTileId } = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { userId: user.id, placedItemType: { tile: { id: TileId.StarterTile }, type: PlacedItemType.Tile } },
            relations: { placedItemType: { tile: true } },
        })

        await axiosWithAuthInstance.post("/plant-seed", { inventorySeedId, placedItemTileId })

        const crop = await dataSource.manager.findOne(CropEntity, { where: { id: cropId } })

        // Speed up growth to harvestable stage
        for (let stage = 2; stage <= crop.growthStages; stage++) {
            await lastValueFrom(gameplayService.speedUp({ time: crop.growthStageDuration }))
            await sleep(2000)

            const seedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: { placedItemId: placedItemTileId },
            })

            if (seedGrowthInfo.currentState === CropCurrentState.NeedWater) {
                await axiosWithAuthInstance.post("/water", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsWeedy) {
                await axiosWithAuthInstance.post("/use-herbicide", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsInfested) {
                await axiosWithAuthInstance.post("/use-pesticide", { placedItemTileId })
            }
        }

        // Crop should be fully matured
        const fullyMaturedInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { placedItemId: placedItemTileId },
        })
        expect(fullyMaturedInfo.currentState).toBe(CropCurrentState.FullyMatured)

        // Thief steals the crop
        const thiefAxios = createAxios(AxiosConfigType.WithAuth, { version: ApiVersion.V1, accessToken: thiefAccessToken })
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
