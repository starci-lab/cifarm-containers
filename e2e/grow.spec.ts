import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    VerifySignatureRequest,
    VerifySignatureResponse
} from "@apps/auth-service"
import { BuySeedsRequest, BuySeedsResponse } from "@apps/gameplay-service"
import { Network, SupportedChainKey } from "@src/config"
import { CropId } from "@src/database"
import axios, { AxiosResponse } from "axios"

describe("Authentication and Gameplay Flow", () => {
    let accessToken: string

    beforeAll(async () => {
        console.log("Ensure all services are running...")
    })

    it("Should complete the main authentication and gameplay flow", async () => {
        try {
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

            const verifySignatureResponse: AxiosResponse<VerifySignatureResponse> =
                await axios.post(
                    "http://localhost:3001/auth/verify-signature",
                    verifySignatureRequest
                )
            console.log("Verify Signature Response:", verifySignatureResponse.data)

            // Extract accessToken from the response
            accessToken = verifySignatureResponse.data.accessToken

            // Step 3: Call POST /gameplay/buy-seeds with accessToken in the header
            console.log("Calling POST /gameplay/buy-seeds...")
            const buySeedsRequest: BuySeedsRequest = {
                cropId: CropId.Carrot,
                quantity: 10,
                userId: null
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
        } catch (error) {
            console.error("Test failed:", JSON.stringify(error, null, 2))
            if (error.response) {
                console.error("Error Response Data:", error.response.data)
            }
            throw error
        }
    }, 60000)

    afterAll(() => {
        console.log("Stopping services...")
    })
})
