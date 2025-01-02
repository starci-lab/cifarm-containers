// npx jest --config ./e2e/jest.json ./e2e/upgrade-building.spec.ts

import { Test } from "@nestjs/testing"
import {
    GameplayPostgreSQLModule,
    PlacedItemEntity,
    UserEntity,
} from "@src/databases"
import { EnvModule } from "@src/env"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { DataSource } from "typeorm"
import { ApiVersion, AxiosConfigType, createAxios } from "./e2e.utils"
import { Network, SupportedChainKey } from "@src/blockchain"

// Test for upgrading building

describe("Upgrade Building flow", () => {
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

    it("Should upgrade a building successfully", async () => {
        const axios = createAxios(AxiosConfigType.WithAuth, {
            version: ApiVersion.V1,
            accessToken,
        })

        // Add golds for the user
        await dataSource.manager.update(
            UserEntity,
            { id: user.id },
            { golds: 30000 }
        )

        // Construct a building
        const position = { x: 1, y: 1 }
        const buildingId = "coop" // Example building ID
        const { data: constructResponse } = await axios.post("/construct-building", {
            buildingId,
            position,
        })

        const placedItemBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                id: constructResponse.placedItemId,
                x: position.x,
                y: position.y,
            },
            relations: {
                buildingInfo: true,
            }
        })

        expect(placedItemBuilding).toBeDefined()

        // Upgrade the building
        const { data: upgradeResponse } = await axios.post("/upgrade-building", {
            placedItemId: placedItemBuilding.id,
        })

        expect(upgradeResponse).toBeDefined()

        // Verify the building upgrade
        const upgradedBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                id: placedItemBuilding.id,
            },
            relations: {
                buildingInfo: true,
            }
        })

        expect(upgradedBuilding).toBeDefined()
        expect(upgradedBuilding.buildingInfo.currentUpgrade).toBeGreaterThan(placedItemBuilding.buildingInfo.currentUpgrade)
    })

    afterAll(async () => {
        // Clean up user after the test
        await dataSource.manager.delete(UserEntity, user.id)
    })
})
