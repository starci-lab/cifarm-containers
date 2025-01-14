//npx jest --config ./e2e/jest.json ./e2e/use-fertilizer.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import { Network, SupportedChainKey } from "@src/blockchain"
import { sleep } from "@src/common"
import { CropCurrentState, CropEntity, CropId, GameplayPostgreSQLModule, InventoryEntity, InventoryType, PlacedItemEntity, PlacedItemType, SeedGrowthInfoEntity, SupplyEntity, SupplyId, TileId, UserEntity } from "@src/databases"
import { EnvModule } from "@src/env"
import { grpcData, GrpcModule } from "@src/grpc"
import { GrpcName } from "@src/grpc/grpc.types"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { ApiVersion, AxiosConfigType, createAxios } from "./e2e.utils"

describe("Grow seed and use fertilizer flow", () => {
    let accessToken: string
    let dataSource: DataSource
    let user: UserLike
    let jwtService: JwtService
    let gameplayService: IGameplayService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EnvModule.forRoot(),
                GameplayPostgreSQLModule.forRoot(),
                GrpcModule.register({
                    name: GrpcName.Gameplay
                }),
                JwtModule
            ],
        }).compile()

        // Sign in and retrieve accessToken
        const authAxios = createAxios(AxiosConfigType.NoAuth, { version: ApiVersion.V1 })
        const { data } = await authAxios.post("/generate-signature", {
            chainKey: SupportedChainKey.Aptos,
            accountNumber: 2,
            network: Network.Mainnet,
        })
        const { data: verifySignatureData } = await authAxios.post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(getGrpcData(GrpcName.Gameplay).data.service)

        // Decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should grow seed successfully", async () => {
        // Test with carrot
        const cropId: CropId = CropId.Carrot
        const gameplayAxios = createAxios(AxiosConfigType.WithAuth, { version: ApiVersion.V1, accessToken })

        // Increase user money
        await dataSource.manager.update(
            UserEntity,
            { id: user.id },
            { golds: 30000 }
        )

        // Buy basic fertilizer from the shop
        await gameplayAxios.post("/buy-supplies", {
            supplyId: SupplyId.BasicFertilizer,
            quantity: 10
        })

        // Buy seeds from the shop
        await gameplayAxios.post("/buy-seeds", {
            cropId,
            quantity: 1
        })

        // Get the inventory
        const { id: inventorySeedId } = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Seed,
                    cropId: cropId
                }
            },
            relations: {
                inventoryType: true
            }
        })

        // Get the first tile
        const { id: placedItemTileId } = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                userId: user.id,
                placedItemType: {
                    tile: {
                        id: TileId.StarterTile
                    },
                    type: PlacedItemType.Tile
                }
            },
            relations: {
                placedItemType: {
                    tile: true
                },
            }
        })

        //Check placedItemTileId
        expect(placedItemTileId).toBeDefined()

        // Plant the seed
        const response = await gameplayAxios.post("/plant-seed", {
            inventorySeedId: inventorySeedId,
            placedItemTileId
        })

        console.log(response.data)

        const fertilizer = await dataSource.manager.findOne(SupplyEntity, {
            where: { id: SupplyId.BasicFertilizer }
        })

        // Speed up the growth for each stage and perform checks
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                id: cropId
            }
        })

        for (let stage = 2; stage <= crop.growthStages; stage++) {
            await lastValueFrom(gameplayService.speedUp({
                time: crop.growthStageDuration - fertilizer.fertilizerEffectTimeReduce
            }))

            //Fertilize the crop
            await gameplayAxios.post("/use-fertilizer", { 
                placedItemTileId
            })

            await sleep(1100)

            // Retrieve the growth info
            const seedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: {
                    placedItemId: placedItemTileId
                }
            })

            // Assert the current growth stage
            expect(seedGrowthInfo.currentStage).toBe(stage)

            if (seedGrowthInfo.currentState === CropCurrentState.NeedWater) {
                await gameplayAxios.post("/water", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsWeedy) {
                await gameplayAxios.post("/use-herbicide", { placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsInfested) {
                await gameplayAxios.post("/use-pesticide", { placedItemTileId })
            }

            // Ensure the crop is in a normal state
            const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: {
                    id: seedGrowthInfo.id
                }
            })
            
            //If not a last stage, crop should be in normal state, otherwise it should be fully matured
            if (stage !== crop.growthStages) {
                expect(updatedSeedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
            }
        }

        // Final assertion: Crop should be fully matured
        const finalSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                placedItemId: placedItemTileId
            }
        })
        expect(finalSeedGrowthInfo.currentStage).toBe(crop.growthStages)
        expect(finalSeedGrowthInfo.currentState).toBe(CropCurrentState.FullyMatured)
    })

    afterAll(async () => {
        //Delete by user id
        await dataSource.manager.delete(UserEntity, user.id)
    })
})
