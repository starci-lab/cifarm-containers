//npx jest --config ./e2e/jest.json ./e2e/delivery-product.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import { Network, SupportedChainKey } from "@src/blockchain"
import { sleep } from "@src/common"
import { CacheKey, CacheRedisModule, CropCurrentState, CropEntity, CropId, DeliveringProductEntity, GameplayPostgreSQLModule, InventoryEntity, InventoryType, PlacedItemEntity, PlacedItemType, SeedGrowthInfoEntity, TileId, UserEntity } from "@src/databases"
import { EnvModule } from "@src/env"
import { grpcData, GrpcModule, GrpcName } from "@src/grpc"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { Cache } from "cache-manager"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { ApiVersion, AxiosConfigType, createAxios } from "./e2e.utils"

describe("Deliver product flow", () => {
    let accessToken: string
    let dataSource: DataSource
    let user: UserLike
    let jwtService: JwtService
    let gameplayService: IGameplayService
    let cacheManager: Cache

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EnvModule.forRoot(),
                GameplayPostgreSQLModule.forRoot(),
                CacheRedisModule.forRoot(),
                GrpcModule.register({
                    name: GrpcName.Gameplay,
                }),
                JwtModule
            ],
        }).compile()

        // Sign in and retrieve accessToken
        const axios = createAxios(AxiosConfigType.NoAuth, { version: ApiVersion.V1 })

        const { data } = await axios.post("/generate-signature", {
            chainKey: SupportedChainKey.Aptos,
            accountNumber: 2,
            network: Network.Mainnet,
        })
        const { data: verifySignatureData } = await axios.post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(getGrpcData(GrpcName.Gameplay).data.service)
        cacheManager = module.get<Cache>(CACHE_MANAGER)

        // Decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should deliver product successfully", async () => {
        //test with carrot
        const cropId: CropId = CropId.Carrot

        const gameplayAxios = createAxios(AxiosConfigType.WithAuth, {
            version: ApiVersion.V1,
            accessToken
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

        // Speed up the growth for each stage and perform checks
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                id: cropId
            }
        })

        for (let stage = 2; stage <= crop.growthStages; stage++) {
            await lastValueFrom(gameplayService.speedUp({
                time: crop.growthStageDuration + 100,
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


        console.log("placedItemTileId", placedItemTileId)

        //Haverst the crop
        await gameplayAxios.post("/harvest-crop", { placedItemTileId: placedItemTileId })

        // //get the inventory
        const inventoryItems = await dataSource.manager.find(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        cropId
                    }
                }
            },
            relations: {
                inventoryType: {
                    product: true
                }
            }
        })
        const [inventoryFirst, inventorySecond] = inventoryItems

        expect(inventoryFirst.quantity).toBeGreaterThan(0)
        expect(inventorySecond.quantity).toBeGreaterThan(0)

        // Deliver the product 2 slot
        await gameplayAxios.post("/deliver-product", {
            userId: user.id,
            index: 1,
            inventoryId: inventoryFirst.id,
            quantity: inventoryFirst.quantity
        })
        await gameplayAxios.post("/deliver-product", {
            userId: user.id,
            index: 2,
            inventoryId: inventorySecond.id,
            quantity: inventorySecond.quantity
        })

        // Ensure the product is delivered
        const updatedInventoryFirst = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                id: inventoryFirst.id
            }
        })

        //Null inventory
        expect(updatedInventoryFirst).toBeNull()

        //Ensure the product is delivered
        const updatedInventorySecond = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                id: inventorySecond.id
            }
        })

        //Null inventory
        expect(updatedInventorySecond).toBeNull()

        //Retain the delivering product
        const retainProductSecond = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: {
                userId: user.id,
                index: 2
            }
        })
        await gameplayAxios.post("/retain-product", {
            deliveringProductId: retainProductSecond.id
        })

        //Ensure the product is retained
        const retainedProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: {
                userId: user.id,
                index: 2
            }
        })
        expect(retainedProduct).toBeNull()

        //Check inventory
        const inventoryAfterRetain = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        cropId
                    }
                }
            }
        })
        expect(inventoryAfterRetain.quantity).toEqual(inventorySecond.quantity)

        // Ensure the product is delivered
        const deliveringProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: {
                userId: user.id,
                index: 1,
            }
        })

        //Check the delivering product
        expect(deliveringProduct).toBeDefined()
        expect(deliveringProduct.quantity).toEqual(inventoryFirst.quantity)

        //Delivery instantly
        await lastValueFrom(gameplayService.deliverInstantly({}))
        await sleep(1100)

        //Check token and deliveringProduct is deleted
        const deliveringProductAfterDelivering = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: {
                userId: user.id,
                index: 1
            }
        })

        expect(deliveringProductAfterDelivering).toBeNull()

        //Get user after
        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: {
                id: user.id
            }
        })

        //Check the user's balance
        expect(userAfter.tokens).toEqual((inventoryFirst.quantity) * inventoryFirst.inventoryType.product.tokenAmount)

        //Check redis
        const hasValue = await cacheManager.get<boolean>(CacheKey.DeliverInstantly)
        expect(hasValue).toBeUndefined()

    })

    afterAll(async () => {
        //await dataSource.manager.delete(UserEntity, user.id)
    })
})


