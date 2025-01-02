// npx jest --config ./e2e/jest.json ./e2e/raise-animal.spec.ts

import { Test } from "@nestjs/testing"
import {
    grpcData,
    GrpcModule,
    GrpcServiceName,
} from "@src/grpc"
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
    UserEntity,
} from "@src/databases"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { DataSource } from "typeorm"
import { lastValueFrom } from "rxjs"
import { sleep } from "@src/common"
import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"
import { EnvModule } from "@src/env"
import { Network, SupportedChainKey } from "@src/blockchain"
import { ApiVersion, AxiosConfigType, createAxios } from "./e2e.utils"

describe("Raise animal flow", () => {
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
                    name: GrpcServiceName.Gameplay,
                }),
                JwtModule,
            ],
        }).compile()

        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(
            grpcData[GrpcServiceName.Gameplay].name
        )
        gameplayService = clientGrpc.getService<IGameplayService>(
            grpcData[GrpcServiceName.Gameplay].service
        )

        // Sign in and retrieve accessToken
        const axios = createAxios(AxiosConfigType.NoAuth, { version: ApiVersion.V1 })

        const { data } = await axios.post("/generate-signature", {
            chainKey: SupportedChainKey.Aptos,
            accountNumber: 2,
            network: Network.Mainnet,
        })
        const { data: verifySignatureData } = await axios.post(
            "/verify-signature",
            data
        )

        accessToken = verifySignatureData.accessToken
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should raise animal successfully", async () => {
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
            await lastValueFrom(gameplayService.speedUp({ time: animal.hungerTime + 100 }))
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

        // Handle yield process
        await axios.post("/collect-animal-product", { 
            placedItemAnimalId: animalInfo.placedItemId
        })

        // Ensure the animal returns to a normal state
        animalInfo = await dataSource.manager.findOne(
            AnimalInfoEntity,
            {
                where: {
                    id: animalInfo.id,
                },
            }
        )
        expect(animalInfo.currentState).toBe(
            AnimalCurrentState.Normal
        )

        //Check inventory
        const inventoryItem = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    product: {
                        type: ProductType.Animal,
                        animalId: animalId,
                    },
                }
            },
        })
        expect(inventoryItem).toBeDefined()
        expect(inventoryItem.quantity).toBeGreaterThan(0)
    })

    afterAll(async () => {
        // Remove user after the test
        await dataSource.manager.delete(UserEntity, user.id)
    })
})
