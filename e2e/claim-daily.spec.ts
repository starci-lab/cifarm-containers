//npx jest --config ./e2e/jest.json ./e2e/claim-daily.spec.ts

import { Test } from "@nestjs/testing"
import {
    GameplayPostgreSQLModule,
    UserEntity,
    DailyRewardEntity,
    SpinSlotEntity,
    SpinPrizeType,
} from "@src/databases"
import { EnvModule } from "@src/env"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { DataSource } from "typeorm"
import { AxiosConfigType, createAxios } from "./e2e.utils"
import { Network, SupportedChainKey } from "@src/blockchain"

// Test for claim daily reward and spin functionality

describe("Claim Daily Reward and Spin flow", () => {
    let accessToken: string
    let dataSource: DataSource
    let user: UserLike
    let jwtService: JwtService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                EnvModule.forRoot(),
                GameplayPostgreSQLModule.forRoot(),
                JwtModule,
            ],
        }).compile()

        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)

        // Sign in and retrieve accessToken
        const axios = createAxios(AxiosConfigType.NoAuth, { version: "v1" })

        const { data } = await axios.post("/test-signature", {
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

        // Set initial gold balance and ensure daily rewards exist
        await dataSource.manager.update(UserEntity, { id: user.id }, { golds: 30000 })
        const dailyRewards = await dataSource.manager.find(DailyRewardEntity)
        if (dailyRewards.length < 5) {
            for (let i = 1; i <= 5; i++) {
                await dataSource.manager.save(DailyRewardEntity, {
                    day: i,
                    golds: 100 * i,
                    tokens: i === 5 ? 10 : 0,
                })
            }
        }
    })

    it("Should claim daily reward successfully", async () => {
        const axios = createAxios(AxiosConfigType.WithAuth, {
            version: "v1",
            accessToken,
        })

        // Claim the daily reward
        const { data: claimResponse } = await axios.post("/claim-daily-reward", {})
        expect(claimResponse).toBeDefined()

        // Verify user's daily reward streak and gold balance
        const userAfterClaim = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
        })

        expect(userAfterClaim.dailyRewardStreak).toBeGreaterThan(0)
        expect(userAfterClaim.golds).toBeGreaterThan(30000)
    })

    it("Should spin successfully and reward appropriately", async () => {
        const axios = createAxios(AxiosConfigType.WithAuth, {
            version: "v1",
            accessToken,
        })

        // Perform the spin
        const { data: spinResponse } = await axios.post("/spin", {})
        expect(spinResponse).toBeDefined()
        expect(spinResponse.spinSlotId).toBeDefined()

        // Verify spin slot existence and reward application
        const spinSlot = await dataSource.manager.findOne(SpinSlotEntity, {
            where: { id: spinResponse.spinSlotId },
            relations: { spinPrize: true },
        })

        expect(spinSlot).toBeDefined()
        const userAfterSpin = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
        })

        if (spinSlot.spinPrize.type === SpinPrizeType.Gold) {
            expect(userAfterSpin.golds).toBeGreaterThan(30000)
        } else {
            // Add checks for other prize types like tokens, seeds, supplies, etc.
        }
    })

    afterAll(async () => {
        // Clean up user after the test
        await dataSource.manager.delete(UserEntity, user.id)
    })
})
