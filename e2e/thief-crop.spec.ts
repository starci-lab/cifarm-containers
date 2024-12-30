//npx jest --config ./e2e/jest.json ./e2e/thief-crop.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import {
    authAxios,
    gameplayAxios,
    grpcData,
    GrpcServiceName,
    Network,
    socket,
    SupportedChainKey
} from "@src/grpc"
import {
    CropCurrentState,
    CropEntity,
    CropId,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    PlacedItemType,
    ProductType,
    SeedGrowthInfoEntity,
    TileId,
    UserEntity
} from "@src/databases"
import {
    configForRoot,
    grpcClientRegisterAsync,
    typeOrmForFeature,
    typeOrmForRoot
} from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { sleep } from "@src/common/utils"
import { console } from "inspector"
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

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                configForRoot(),
                typeOrmForRoot(),
                 ,
                grpcClientRegisterAsync(GrpcServiceName.Gameplay),
                JwtModule
            ]
        }).compile()

        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcServiceName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(grpcData[GrpcServiceName.Gameplay].service)

        //sign in
        //get mesasge
        const { data } = await authAxios().post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet
        })
        const { data: verifySignatureData } = await authAxios().post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        //decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)


        //sign in thief
        const { data: dataThief } = await authAxios().post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet
        })
        const { data: verifySignatureDataThief } = await authAxios().post("/verify-signature", dataThief)
        accessToken = verifySignatureDataThief.accessToken

        thiefAccessToken = verifySignatureDataThief.accessToken
        thiefUser = await jwtService.decodeToken(thiefAccessToken)

    })

    it("Should thief flow success", async () => {
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

        //get crop carrot
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                id: cropId
            }
        })

        // speed & sleep 1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(2000)

        //retrive the seed growth info
        const { seedGrowthInfo } = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                id: placedItemTileId
            },
            relations: {
                seedGrowthInfo: true
            }
        })

        //check if crop at stage 2
        const seedGrowthInfoInitialCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoInitialCheck.currentStage).toBe(2)

        //if need water, we than water the crop
        if (seedGrowthInfoInitialCheck.currentState === CropCurrentState.NeedWater) {
            console.log("Watering the crop at stage 2")
            await axios.post("/water", {
                placedItemTileId
            })
        }

        //then, make sure the crop is normal
        const seedGrowthInfoSecondCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoSecondCheck.currentState).toBe(CropCurrentState.Normal)

        // speed & sleep 1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(2000)

        //retrive the seed growth info
        const seedGrowthInfoThirdCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoThirdCheck.currentStage).toBe(3)

        //if need water, we than water the crop
        if (seedGrowthInfoThirdCheck.currentState === CropCurrentState.NeedWater) {
            console.log("Watering the crop at stage 3")
            await axios.post("/water", {
                placedItemTileId
            })
        }
        const seedGrowthInfoForthCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoForthCheck.currentState).toBe(CropCurrentState.Normal)

        // speed & sleep 1.1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(2000)

        //retrive the seed growth info
        const seedGrowthInfoFifthCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoFifthCheck.currentStage).toBe(4)

        //if infested, we than use pesticide
        if (seedGrowthInfoFifthCheck.currentState === CropCurrentState.IsInfested) {
            console.log("Using pesticide on the crop at stage 4")
            await axios.post("/use-pesticide", {
                placedItemTileId
            })
        } 
        //if weedy, we than use herbicide
        else if (seedGrowthInfoFifthCheck.currentState === CropCurrentState.IsWeedy) {
            console.log("Using herbicide on the crop at stage 4")
            await axios.post("/use-herbicide", {
                placedItemTileId
            })
        }
        //then, make sure the crop is normal
        const seedGrowthInfoSixthCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoSixthCheck.currentState).toBe(CropCurrentState.Normal)

        // speed & sleep 1.1s to wait for cron to process
        await lastValueFrom(gameplayService.speedUp({
            time: crop.growthStageDuration
        }))
        await sleep(2000)

        //now, the crop is ready to be harvested
        const seedGrowthInfoSeventhCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            }
        })
        expect(seedGrowthInfoSeventhCheck.currentStage).toBe(CropCurrentState.FullyMatured) 

        //create thief axios
        const thiefAxios = gameplayAxios(thiefAccessToken)

        //process thief
        const { data: thiefCropResponseData } = await thiefAxios.post("/thief-crop", {
            placedItemTileId,
            neighborUserId: user.id
        })

        //make sure the crop is stolen
        const seedGrowthInfoEightCheck = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: {
                id: seedGrowthInfo.id,
            },
            relations: {
                crop: true
            }
        })
        expect(seedGrowthInfoEightCheck.harvestQuantityRemaining).toBe(seedGrowthInfoEightCheck.crop.maxHarvestQuantity - thiefCropResponseData.quantity)
        //get the inventory of the thief
        const thiefInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: thiefUser.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Crop,
                        cropId
                    },
                }
            }
        })

        expect(thiefInventory.quantity).toBe(thiefCropResponseData.quantity)


        //Test websocket
        const socketBroadcast = socket("http://localhost:3006/broadcast")

        socketBroadcast.on("hello_world", (data: any) => {
            expect(data.message).toBe("Hello World")
        })

        socketBroadcast.emit("send_hello_world_to_all")
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, user)
        await dataSource.manager.remove(UserEntity, thiefUser)
    })
})
