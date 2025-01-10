// npx jest --config ./e2e/jest.json ./e2e/place-tile.spec.ts

import { Test } from "@nestjs/testing"
import { Network, SupportedChainKey } from "@src/blockchain"
import {
    GameplayPostgreSQLModule,
    InventoryEntity,
    PlacedItemEntity
} from "@src/databases"
import { EnvModule } from "@src/env"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { DataSource } from "typeorm"
import { AxiosConfigType, createAxios } from "./e2e.utils"

describe("Placement flow", () => {
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

    it("Should execute placement flow successfully", async () => {
        const axios = createAxios(AxiosConfigType.WithAuth, {
            version: "v1",
            accessToken,
        })

        // Step 1: Buy a tile
        const position = { x: 2, y: 3 }
        await axios.post("/buy-tile", {
            position,
        })

        // Get PlacedItemTile
        const placedItemTileAfterBuying = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                x: position.x,
                y: position.y,
            },
        })

        // Step 2: Move the tile
        const newPosition = { x: 4, y: 5 }
        await axios.post("/move", {
            placedItemId: placedItemTileAfterBuying.id,
            position: newPosition,
        })

        const movedTile = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                id: placedItemTileAfterBuying.id,
                x: newPosition.x,
                y: newPosition.y,
            },
        })

        expect(movedTile).toBeDefined()
        expect(movedTile.x).toBe(newPosition.x)
        expect(movedTile.y).toBe(newPosition.y)

        // Step 3: Recover the tile
        const { data: recoverTileResponse } = await axios.post("/recover-tile", {
            placedItemTileId: movedTile.id,
        })

        const recoveredTile = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                id: recoverTileResponse.inventoryTileId,
            },
        })

        expect(recoveredTile).toBeDefined()


        // Step 4: Place the tile
        const { data: placeTileResponse } = await axios.post("/place-tile", {
            inventoryTileId: recoverTileResponse.inventoryTileId,
            position,
        })

        const placedItemTile = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                id: placeTileResponse.placedItemTileId,
            },
        })

        expect(placedItemTile).toBeDefined()
        expect(placedItemTile.x).toBe(position.x)
        expect(placedItemTile.y).toBe(position.y)
    })

    afterAll(async () => {
        // Remove user after the test
        // await dataSource.manager.delete(UserEntity, user.id)
    })
})
