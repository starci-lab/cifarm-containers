import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import { authAxios, gameplayAxios, grpcConfig, GrpcServiceName, Network, SupportedChainKey } from "@src/config"
import { CropCurrentState, CropEntity, CropId, DeliveringProductEntity, InventoryEntity, InventoryType, PlacedItemEntity, PlacedItemType, SeedGrowthInfoEntity, TileId } from "@src/database"
import { configForRoot, grpcClientRegisterAsync, typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { sleep } from "@src/utils"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"

describe("Deliver product flow", () => {
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

    it("Should deliver product successfully", async () => {
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
        expect(finalSeedGrowthInfo.fullyMatured).toBe(true)


        console.log("placedItemTileId", placedItemTileId)

        //Haverst the crop
        await axios.post("/harvest-crop", { placedItemTileId: placedItemTileId })

        // //get the inventory
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
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

        expect(inventory.quantity).toBeGreaterThan(0)

        console.log("inventory", inventory.quantity)

        // Deliver the product
        await axios.post("/deliver-product", {
            userId: user.id,
            index: 1,
            inventoryId: inventory.id,
            quantity: inventory.quantity
        })

        // Ensure the product is delivered
        const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                id: inventory.id
            }
        })

        //Null inventory
        expect(updatedInventory).toBeNull()

        // Ensure the product is delivered
        const deliveringProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: {
                userId: user.id,
                index: 1,
            }
        })

        //Check the delivering product
        expect(deliveringProduct.quantity).toBeDefined()
        expect(deliveringProduct.quantity).toEqual(inventory.quantity)
    })

    afterAll(async () => {
        // await dataSource.manager.remove(UserEntity, user)
    })
})


