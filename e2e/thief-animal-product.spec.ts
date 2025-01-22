// npx jest --config ./e2e/jest.json ./e2e/thief-animal-product.spec.ts

import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import { Network, ChainKey } from "@src/blockchain"
import { sleep } from "@src/common"
import {
    AnimalCurrentState,
    AnimalEntity,
    AnimalInfoEntity,
    BuildingId,
    GameplayPostgreSQLModule,
    InventoryEntity,
    PlacedItemEntity,
    PlacedItemTypeId,
    ProductType,
    SupplyId,
    UserEntity
} from "@src/databases"
import { EnvModule } from "@src/env"
import {
    grpcData,
    GrpcModule,
    GrpcName,
} from "@src/grpc"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { ApiVersion, AxiosConfigType, createAxios } from "./e2e.utils"

describe("Thief Animal Product flow", () => {
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
                GrpcModule.register({
                    name: GrpcName.Gameplay,
                }),
                JwtModule,
            ],
        }).compile()

        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(grpcData[GrpcName.Gameplay].name)
        gameplayService = clientGrpc.getService<IGameplayService>(getGrpcData(GrpcName.Gameplay).data.service)

        // Sign in as main user
        const authAxios = createAxios(AxiosConfigType.NoAuth, { version: ApiVersion.V1 })
        const { data } = await authAxios.post("/generate-signature", {
            chainKey: ChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet,
        })
        const { data: verifySignatureData } = await authAxios.post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        user = await jwtService.decodeToken(accessToken)

        // Sign in as thief
        const { data: thiefData } = await authAxios.post("/generate-signature", {
            chainKey: ChainKey.Avalanche,
            accountNumber: 2,
            network: Network.Testnet,
        })
        const { data: verifyThiefSignatureData } = await authAxios.post("/verify-signature", thiefData)

        thiefAccessToken = verifyThiefSignatureData.accessToken
        thiefUser = await jwtService.decodeToken(thiefAccessToken)
    })

    it("Should thief animal product successfully", async () => {
        // Test with an animal (e.g., cow)
        const animalId = "chicken"
        
        const axios = createAxios(AxiosConfigType.WithAuth, {
            version: ApiVersion.V1,
            accessToken,
        })
        
        
        // Increase user money
        await dataSource.manager.update(
            UserEntity,
            { id: user.id },
            { golds: 30000 }
        )
        
        // Buy animal food
        await axios.post("/buy-supplies", {
            supplyId: SupplyId.AnimalFeed,
            quantity: 5
        })
        
        // Construct a building
        await axios.post("/construct-building", {
            buildingId: BuildingId.Coop,
            position: {
                x: 1,
                y: 1
            }
        })
        
        //Find placedItemBuilding
        const placedItemBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                userId: user.id,
                placedItemTypeId: PlacedItemTypeId.Coop,
                x: 1,
                y: 1,
            }
        })
        // Check if the building is constructed
        expect(placedItemBuilding).toBeDefined()
        
        // Buy an animal from the shop
        await axios.post("/buy-animal", {
            animalId,
            placedItemBuildingId: placedItemBuilding.id,
            position: {
                x: 0,
                y: 0,
            }
        })
        
        // Get the animal info
        let animalInfo = await dataSource.manager.findOne(
            AnimalInfoEntity,
            {
                where: {
                    animal: {
                        id: animalId,
                    },
                },
                relations: {
                    animal: true,
                },
            }
        )
        
        // Retrieve the animal data
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: {
                id: animalId,
            },
        })
        
        // Buy 
        
        //while stage is not mature
        while (!animalInfo.isAdult) {
            // Speed up and feed until the animal is an adult
            await lastValueFrom(gameplayService.speedUp({ time: animal.hungerTime + 10 }))
            await sleep(1100)
        
            // check if the animal is hungry
            animalInfo = await dataSource.manager.findOne(
                AnimalInfoEntity,
                {
                    where: {
                        id: animalInfo.id,
                    },
                }
            )
        
            expect(animalInfo.currentState).toBe(AnimalCurrentState.Hungry)
        
            // Feed the animal            
            await axios.post("/feed-animal", { 
                placedItemAnimalId: animalInfo.placedItemId
            })
        
            animalInfo = await dataSource.manager.findOne(
                AnimalInfoEntity,
                {
                    where: {
                        id: animalInfo.id,
                    },
                }
            )
        
            expect(animalInfo.currentState).toBe(AnimalCurrentState.Normal)
        }
        
        
        // Speed up growth and yield process
        while(animalInfo.currentState != AnimalCurrentState.Yield){
            await lastValueFrom(gameplayService.speedUp({ time: animal.yieldTime  }))
            await sleep(1100)
        
            animalInfo = await dataSource.manager.findOne(
                AnimalInfoEntity,
                {
                    where: {
                        id: animalInfo.id,
                    },
                }
            )
        
            // Check if the animal is in a yield state(if sick, cure it)
            if(animalInfo.currentState === AnimalCurrentState.Sick){
                await axios.post("/cure-animal", { 
                    placedItemAnimalId: animalInfo.placedItemId
                })
            }
        }

        // Thief steals the product
        const thiefAxios = createAxios(AxiosConfigType.WithAuth, { version: ApiVersion.V1, accessToken: thiefAccessToken })
        const { data: thiefResponse } = await thiefAxios.post("/thief-animal-product", {
            placedItemAnimalId: animalInfo.placedItemId,
            neighborUserId: user.id,
        })

        // Verify thief's inventory
        const thiefInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: thiefUser.id,
                inventoryType: {
                    product: { type: ProductType.Animal, animalId },
                },
            },
        })

        expect(thiefInventory).toBeDefined()
        expect(thiefInventory.quantity).toBe(thiefResponse.quantity)
    })

    afterAll(async () => {
        await dataSource.manager.delete(UserEntity, user.id)
        await dataSource.manager.delete(UserEntity, thiefUser.id)
    })
})
