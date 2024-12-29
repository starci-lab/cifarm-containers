// npx jest --config ./e2e/jest.json ./e2e/raise-animal.spec.ts

import { Test } from "@nestjs/testing"
import {
    authAxios,
    gameplayAxios,
    grpcData,
    GrpcServiceName,
    Network,
    SupportedChainKey,
} from "@src/grpc"
import {
    AnimalCurrentState,
    AnimalEntity,
    AnimalInfoEntity,
} from "@src/databases"
import {
    configForRoot,
    grpcClientRegisterAsync,
    typeOrmForFeature,
    typeOrmForRoot,
} from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { DataSource } from "typeorm"
import { lastValueFrom } from "rxjs"
import { sleep } from "@src/common/utils"
import { IGameplayService } from "@apps/gameplay-service"
import { ClientGrpc } from "@nestjs/microservices"

describe("Raise animal flow", () => {
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
                JwtModule,
            ],
        }).compile()

        // Sign in and retrieve accessToken
        const { data } = await authAxios("v1").post("/test-signature", {
            chainKey: SupportedChainKey.Aptos,
            accountNumber: 2,
            network: Network.Mainnet,
        })
        const { data: verifySignatureData } = await authAxios("v1").post("/verify-signature", data)

        accessToken = verifySignatureData.accessToken
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        const clientGrpc = module.get<ClientGrpc>(
            grpcData[GrpcServiceName.Gameplay].name
        )
        gameplayService = clientGrpc.getService<IGameplayService>(
            grpcData[GrpcServiceName.Gameplay].service
        )

        // Decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should raise animal successfully", async () => {
        // Test with an animal (e.g., cow)
        const animalId = "cow" // Replace with the appropriate Animal ID

        const axios = gameplayAxios(accessToken, "v1")

        // Buy an animal from the shop
        await axios.post("/buy-animal", {
            animalId,
            quantity: 1,
        })

        // Get the animal info
        const { id: animalInfoId } = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: {
                animal: {
                    id: animalId,
                },
            },
            relations: {
                animal: true,
            },
        })

        // Retrieve the animal data
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: {
                id: animalId,
            },
        })

        // Speed up growth and yield process
        for (let stage = 1; stage <= 2; stage++) { // Assuming 2 stages: growth and yield
            await lastValueFrom(
                gameplayService.speedUp({
                    time: stage === 1 ? animal.growthTime : animal.yieldTime,
                })
            )
            await sleep(1100)

            // Retrieve the updated animal info
            const animalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
                where: {
                    id: animalInfoId,
                },
            })

            if (stage === 1) {
                // Assert animal has grown to adulthood
                expect(animalInfo.isAdult).toBe(true)
            } else {
                // Assert animal is ready for yield
                expect(animalInfo.currentState).toBe(AnimalCurrentState.Yield)

                // Handle yield process
                await axios.post("/harvest-animal", { animalInfoId })

                // Ensure the animal returns to a normal state
                const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
                    where: {
                        id: animalInfoId,
                    },
                })
                expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)
            }

            // Handle other potential states
            if (animalInfo.currentState === AnimalCurrentState.Hungry) {
                await axios.post("/feed-animal", { animalInfoId })
            } else if (animalInfo.currentState === AnimalCurrentState.Sick) {
                await axios.post("/cure-animal", { animalInfoId })
            }

            // Ensure the animal is in a normal state after each cycle
            const recheckedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
                where: {
                    id: animalInfoId,
                },
            })
            expect(recheckedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)
        }
    })

    afterAll(async () => {
        // await dataSource.manager.remove(UserEntity, user)
    })
})
