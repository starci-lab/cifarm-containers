//npx jest --config ./e2e/jest.json ./e2e/delivery.spec.ts

import { Test } from "@nestjs/testing"
import {
    DeliveringProductEntity,
    getPostgreSqlToken,
    InventoryEntity,
    InventoryTypeId,
    ProductEntity,
    ProductId,
    UserSchema
} from "@src/databases"
import { ChainKey, Network } from "@src/env"
import {
    E2EAxiosService,
    E2EConnectionService,
    E2ERAuthenticationService,
    TEST_TIMEOUT,
    TestContext,
    TestingInfraModule
} from "@src/testing"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import {
    DeliverProductRequest,
    DeliverProductResponse,
    RetainProductRequest,
    RetainProductResponse
} from "@apps/gameplay-service"
import { AxiosResponse } from "axios"
import { HttpStatus } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { KAFKA, KafkaPattern } from "@src/brokers"
import { sleep } from "@src/common"

describe("Delivery flow", () => {
    let dataSource: DataSource
    let e2eAxiosService: E2EAxiosService
    let e2eConnectionService: E2EConnectionService
    let e2eAuthenticationService: E2ERAuthenticationService
    let clientKafka: ClientKafka
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register({
                    context: TestContext.E2E
                })
            ]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        e2eAxiosService = moduleRef.get(E2EAxiosService)
        e2eConnectionService = moduleRef.get(E2EConnectionService)
        e2eAuthenticationService = moduleRef.get(E2ERAuthenticationService)
        clientKafka = moduleRef.get(KAFKA)
    })

    it(
        "should delivery flow successfully",
        async () => {
            // Create session
            const name = v4()
            const { authAxios } = e2eAxiosService.create(name)
            const userLike = await e2eAuthenticationService.authenticate({
                name,
                accountNumber: 8,
                chainKey: ChainKey.Solana,
                network: Network.Testnet
            })
            //get actual user
            const user = await dataSource.manager.findOne(UserSchema, {
                where: {
                    id: userLike.id
                }
            })

            dataSource.manager.update(UserSchema, user.id, {
                energyFull: false,
                energy: 0
            })

            //create 3 carrot, 3 premium carrot, 10 eggs, 10 premium eggs
            const inventories = await dataSource.manager.save(InventoryEntity, [
                {
                    userId: user.id,
                    inventoryTypeId: InventoryTypeId.Carrot,
                    quantity: 3
                },
                {
                    userId: user.id,
                    inventoryTypeId: InventoryTypeId.CarrotQuality,
                    quantity: 3
                },
                {
                    userId: user.id,
                    inventoryTypeId: InventoryTypeId.Egg,
                    quantity: 10
                },
                {
                    userId: user.id,
                    inventoryTypeId: InventoryTypeId.EggQuality,
                    quantity: 10
                }
            ])

            //send delivery request
            const carrotProduct = await dataSource.manager.findOne(ProductEntity, {
                where: {
                    id: ProductId.Carrot
                }
            })

            const deliverProduct3CarrotsResponse = await authAxios.post<
                DeliverProductResponse,
                AxiosResponse<DeliverProductResponse, Omit<DeliverProductRequest, "userId">>,
                Omit<DeliverProductRequest, "userId">
            >("/gameplay/deliver-product", {
                inventoryId: inventories[0].id,
                index: 0,
                quantity: 3
            })
            expect(deliverProduct3CarrotsResponse.status).toBe(HttpStatus.CREATED)
            //send delivery request
            const carrotQualityProduct = await dataSource.manager.findOne(ProductEntity, {
                where: {
                    id: ProductId.CarrotQuality
                }
            })
            const deliverProduct3CarrotQualitiesResponse = await authAxios.post<
                DeliverProductResponse,
                AxiosResponse<DeliverProductResponse, Omit<DeliverProductRequest, "userId">>,
                Omit<DeliverProductRequest, "userId">
            >("/gameplay/deliver-product", {
                inventoryId: inventories[1].id,
                index: 1,
                quantity: 3
            })
            expect(deliverProduct3CarrotQualitiesResponse.status).toBe(HttpStatus.CREATED)

            //send delivery request
            const eggProduct = await dataSource.manager.findOne(ProductEntity, {
                where: {
                    id: ProductId.Egg
                }
            })
            const deliverProduct10EggsResponse = await authAxios.post<
                DeliverProductResponse,
                AxiosResponse<DeliverProductResponse, Omit<DeliverProductRequest, "userId">>,
                Omit<DeliverProductRequest, "userId">
            >("/gameplay/deliver-product", {
                inventoryId: inventories[2].id,
                index: 2,
                quantity: 10
            })
            expect(deliverProduct10EggsResponse.status).toBe(HttpStatus.CREATED)

            //send delivery request
            const deliverProduct10EggQualitiesResponse = await authAxios.post<
                DeliverProductResponse,
                AxiosResponse<DeliverProductResponse, Omit<DeliverProductRequest, "userId">>,
                Omit<DeliverProductRequest, "userId">
            >("/gameplay/deliver-product", {
                inventoryId: inventories[3].id,
                index: 3,
                quantity: 10
            })
            expect(deliverProduct10EggQualitiesResponse.status).toBe(HttpStatus.CREATED)

            const deliveringProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
                where: {
                    userId: user.id,
                    index: 3
                }
            })
            //Retain
            const retainProductInIndex3Response = await authAxios.post<
                RetainProductResponse,
                AxiosResponse<RetainProductResponse, Omit<RetainProductRequest, "userId">>,
                Omit<RetainProductRequest, "userId">
            >("/gameplay/retain-product", {
                deliveringProductId: deliveringProduct.id
            })
            expect(retainProductInIndex3Response.status).toBe(HttpStatus.CREATED)

            //send kafka
            clientKafka.emit(KafkaPattern.Delivery, {})
            //sleep 2s for kafka to process
            await sleep(2000)

            // check that user has increased balance
            const updatedUser = await dataSource.manager.findOne(UserSchema, {
                where: { id: user.id },
                relations: {
                    deliveringProducts: true
                }
            })
            // 3 carrots, 3 quality carrots, 10 eggs sold
            expect(updatedUser.golds).toBe(user.golds + 3 * carrotProduct.goldAmount + 3 * carrotQualityProduct.goldAmount + 10 * eggProduct.goldAmount)
            expect(updatedUser.tokens).toBe(user.tokens + 3 * carrotProduct.tokenAmount + 3 * carrotQualityProduct.tokenAmount + 10 * eggProduct.tokenAmount)
            // check if delivering products are deleted
            expect(updatedUser.deliveringProducts).toHaveLength(0)
        },
        TEST_TIMEOUT
    )

    afterAll(async () => {
        await e2eAuthenticationService.clear()
        await e2eConnectionService.closeAll()
    })
})
