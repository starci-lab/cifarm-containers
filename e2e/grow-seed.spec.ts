//npx jest --config ./e2e/jest.json ./e2e/grow-seed.spec.ts

import { Test } from "@nestjs/testing"
import { authAxios, gameplayAxios, grpcConfig, GrpcServiceName, Network, SupportedChainKey } from "@src/config"
import { CropCurrentState, CropEntity, CropId, InventoryEntity, InventoryType, PlacedItemEntity, PlacedItemType, SeedGrowthInfoEntity, TileId, UserEntity } from "@src/database"
import { configForRoot, grpcClientRegisterAsync, typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { DataSource } from "typeorm"
import { lastValueFrom } from "rxjs"
import { sleep } from "@src/utils"
import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"

describe("Grow seed flow", () => {
    let accessToken: string
    let dataSource: DataSource
    let user: UserLike
    let jwtService: JwtService
    let gameplayService: IGameplayService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                configForRoot(),
                typeOrmForRoot(),
                typeOrmForFeature(),
                grpcClientRegisterAsync(GrpcServiceName.Gameplay),
                JwtModule
            ],
        }).compile()

        // Sign in and retrieve accessToken
        const { data } = await authAxios().post("/test-signature", {
            chainKey: SupportedChainKey.Aptos,
            accountNumber: 2,
            network: Network.Mainnet,
        })
        const { data: verifySignatureData } = await authAxios().post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcConfig[GrpcServiceName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(grpcConfig[GrpcServiceName.Gameplay].service)

        // Decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should grow seed successfully", async () => {
        //test with carrot
        const cropId: CropId = CropId.Carrot

        const axios = gameplayAxios(accessToken)

        //buy seeds from the shop
        await axios.post("/buy-seeds", {
            cropId,
            quantity: 1
        })

        //get the inventory
        const { id: inventorySeedId } = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Seed,
                    cropId
                }
            },
            relations: {
                inventoryType: true
            }
        })
        //get the first tile
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

        //plant the seed
        await axios.post("/plant-seed", {
            inventorySeedId,
            placedItemTileId
        })

        // Speed up the growth for each stage and perform checks
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                id: cropId
            }
        })

        for (let stage = 2; stage <= crop.growthStages; stage++) {
            await lastValueFrom(gameplayService.speedUp({
                time: crop.growthStageDuration
            }))
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
                await axios.post("/water", { placedItemTileId: placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsWeedy) {
                await axios.post("/use-herbicide", { placedItemTileId: placedItemTileId })
            } else if (seedGrowthInfo.currentState === CropCurrentState.IsInfested) {
                await axios.post("/use-pesticide", { placedItemTileId: placedItemTileId })
            }

            // Ensure the crop is in a normal state
            const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
                where: {
                    id: seedGrowthInfo.id
                }
            })

            expect(updatedSeedGrowthInfo.currentState).toBe(CropCurrentState.Normal)

        }

        // Final assertion: Crop should be fully matured
        const finalSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                placedItemId: placedItemTileId
            }
        })
        expect(finalSeedGrowthInfo.currentStage).toBe(CropCurrentState.FullyMatured)
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, user)
    })
})
