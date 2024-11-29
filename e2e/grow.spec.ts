import {
    AppModule,
    authGrpcConstants,
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    VerifySignatureRequest,
    VerifySignatureResponse
} from "@apps/auth-service"
import { BuySeedsRequest, BuySeedsResponse, gameplayGrpcConstants } from "@apps/gameplay-service"
import { INestApplication } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ClientProxy, ClientsModule, Transport } from "@nestjs/microservices"
import { Test } from "@nestjs/testing"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { CropId } from "@src/database"
import axios, { AxiosResponse } from "axios"

describe("Authentication and Gameplay Flow", () => {
    let accessToken: string
    let app: INestApplication
    let authClient: ClientProxy
    let gameplayClient: ClientProxy

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [
                //env
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: [".env.local"],
                    isGlobal: true
                }),
                AppModule,
                ClientsModule.register([
                    {
                        name: authGrpcConstants.NAME,
                        transport: Transport.GRPC,
                        options: {
                            url: `${envConfig().containers.authService.host}:${envConfig().containers.authService.port}`,
                            package: authGrpcConstants.PACKAGE,
                            protoPath: authGrpcConstants.PROTO_PATH
                        }
                    },
                    {
                        name: gameplayGrpcConstants.NAME,
                        transport: Transport.GRPC,
                        options: {
                            url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
                            package: gameplayGrpcConstants.PACKAGE,
                            protoPath: gameplayGrpcConstants.PROTO_PATH
                        }
                    }
                ])
            ]
        }).compile()

        app = moduleFixture.createNestApplication()

        app.connectMicroservice({
            transport: Transport.GRPC,
            options: {
                url: `${envConfig().containers.authService.host}:${envConfig().containers.authService.port}`,
                package: authGrpcConstants.PACKAGE,
                protoPath: authGrpcConstants.PROTO_PATH
            }
        })

        app.connectMicroservice({
            transport: Transport.GRPC,
            options: {
                url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
                package: gameplayGrpcConstants.PACKAGE,
                protoPath: gameplayGrpcConstants.PROTO_PATH
            }
        })

        await app.startAllMicroservices()

        await app.init()

        authClient = app.get(authGrpcConstants.NAME)
        gameplayClient = app.get(gameplayGrpcConstants.NAME)
    })

    it("Should complete the main authentication and gameplay flow", async () => {
        // Step 1: Call POST /auth/test-signature
        console.log("Calling POST /auth/test-signature...")
        const testSignatureRequest: GenerateTestSignatureRequest = {
            chainKey: "avalanche",
            accountNumber: 0,
            network: Network.Testnet
        }

        const testSignatureResponse: AxiosResponse<GenerateTestSignatureResponse> =
            await axios.post("http://localhost:3001/auth/test-signature", testSignatureRequest)

        console.log("Test Signature Response:", testSignatureResponse.data)

        // Step 2: Call POST /auth/verify-signature
        console.log("Calling POST /auth/verify-signature...")
        const verifySignatureRequest: VerifySignatureRequest = {
            message: testSignatureResponse.data.message,
            signature: testSignatureResponse.data.signature,
            chainKey: testSignatureResponse.data.chainKey as SupportedChainKey.Avalanche,
            network: testSignatureResponse.data.network,
            publicKey: testSignatureResponse.data.publicKey,
            accountAddress: testSignatureResponse.data.accountAddress
        }

        const verifySignatureResponse: AxiosResponse<VerifySignatureResponse> = await axios.post(
            "http://localhost:3001/auth/verify-signature",
            verifySignatureRequest
        )

        console.log("Verify Signature Response:", verifySignatureResponse.data)

        // Extract accessToken from verifySignatureResponse
        accessToken = verifySignatureResponse.data.accessToken

        // Step 3: Call POST /gameplay/buy-seeds with accessToken in the header
        console.log("Calling POST /gameplay/buy-seeds...")
        const buySeedsRequest: BuySeedsRequest = {
            cropId: CropId.Carrot,
            quantity: 10,
            userId: verifySignatureResponse.data.userId
        }

        const buySeedsResponse: AxiosResponse<BuySeedsResponse> = await axios.post(
            "http://localhost:3001/gameplay/buy-seeds",
            buySeedsRequest,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        console.log("Buy Seeds Response:", buySeedsResponse.data)

        // Assertions
        expect(buySeedsResponse.status).toBe(200)
        expect(buySeedsResponse.data.success).toBe(true)
    }, 30000)

    afterAll(async () => {
        // Stop all services
        console.log("Stopping services...")
        console.log(authClient)
        console.log(gameplayClient)
        if (app != null) {
            await app.close()
        }

        console.log("Services stopped")
    })
})
