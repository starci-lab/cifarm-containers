import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { DeliveringProductEntity, ProductId, UserEntity } from "@src/databases"
import { DeliveringProductNotFoundException } from "@src/exceptions"
import { DataSource, DeepPartial } from "typeorm"
import { RetainProductRequest, RetainProductResponse } from "./retain-product.dto"
import { RetainProductModule } from "./retain-product.module"
import { RetainProductService } from "./retain-product.service"

describe("RetainProductService", () => {
    let dataSource: DataSource
    let service: RetainProductService

    const users: Array<DeepPartial<UserEntity>> = [
        {
            username: "test_user_retain_product_1",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 5000,
            deliveringProducts: [
                {
                    quantity: 5,
                    premium: false,
                    productId: "product_1",
                    index: 1
                }
            ] as DeepPartial<Array<DeliveringProductEntity>>
        },
        {
            username: "test_user_retain_product_2",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 100,
            deliveringProducts: [
                {
                    quantity: 1,
                    premium: false,
                    productId: "product_2",
                    index: 2
                }
            ] as DeepPartial<Array<DeliveringProductEntity>>
        }
    ]

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: [".env.local"],
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().database.postgres.gameplay.test.host,
                    port: envConfig().database.postgres.gameplay.test.port,
                    username: envConfig().database.postgres.gameplay.test.user,
                    password: envConfig().database.postgres.gameplay.test.pass,
                    database: envConfig().database.postgres.gameplay.test.dbName,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                RetainProductModule
            ]
        }).compile()

        dataSource = module.get(DataSource)
        service = module.get(RetainProductService)
    })

    it("Should retain a delivering product successfully", async () => {
        const userBeforeRetainProduct = await dataSource.manager.save(UserEntity, users[0])

        //Insert delivering product
        const deliveringProduct = await dataSource.manager.save(DeliveringProductEntity, {
            userId: userBeforeRetainProduct.id,
            quantity: 5,
            premium: false,
            productId: ProductId.Egg,
            index: 1,
        })

        const retainProductRequest: RetainProductRequest = {
            userId: deliveringProduct.userId,
            deliveringProductId: deliveringProduct.id
        }

        const response: RetainProductResponse = await service.retainProduct(retainProductRequest)

        // Verify that the delivering product is removed
        const deletedProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: { id: deliveringProduct.id }
        })
        expect(deletedProduct).toBeNull()

        // Verify log success
        expect(response).toBeDefined()
    })

    it("Should fail when delivering product does not exist", async () => {
        const userBeforeRetainProduct = await dataSource.manager.save(UserEntity, users[1])

        const invalidProductId = "invalid_id"
        const retainProductRequest: RetainProductRequest = {
            userId: userBeforeRetainProduct.id,
            deliveringProductId: invalidProductId
        }

        await expect(service.retainProduct(retainProductRequest)).rejects.toThrow(
            new DeliveringProductNotFoundException(invalidProductId)
        )
    })

    afterAll(async () => {
        await dataSource.manager.delete(UserEntity, users)
    })
})
