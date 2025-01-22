// npx jest --config ./e2e/jest.json ./e2e/help-cure-animal.spec.ts

import { Test } from "@nestjs/testing"
import { Network, ChainKey } from "@src/blockchain"
import {
    AnimalCurrentState,
    AnimalInfoEntity,
    BuildingId,
    GameplayPostgreSQLModule,
    PlacedItemEntity,
    PlacedItemTypeId,
    UserEntity
} from "@src/databases"
import { EnvModule } from "@src/env"
import { JwtModule, JwtService, UserLike } from "@src/jwt"
import { DataSource } from "typeorm"
import { ApiVersion, AxiosConfigType, createAxios } from "./e2e.utils"

describe("Help Cure Animal flow", () => {
    let user: UserLike
    let accessToken: string

    let helperUser: UserLike
    let helperAccessToken: string

    let dataSource: DataSource
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

        // Sign in as helper
        const { data: helperData } = await authAxios.post("/generate-signature", {
            chainKey: ChainKey.Avalanche,
            accountNumber: 2,
            network: Network.Testnet,
        })
        const { data: verifyHelperSignatureData } = await authAxios.post("/verify-signature", helperData)

        helperAccessToken = verifyHelperSignatureData.accessToken
        helperUser = await jwtService.decodeToken(helperAccessToken)
    })

    it("Should help cure an animal successfully", async () => {
        const animalId = "chicken"

        const axios = createAxios(AxiosConfigType.WithAuth, { version: ApiVersion.V1, accessToken })

        // Increase user money
        await dataSource.manager.update(UserEntity, { id: user.id }, { golds: 30000 })
        await dataSource.manager.update(UserEntity, { id: helperUser.id }, { golds: 30000 })

        // Construct a building and buy an animal
        await axios.post("/construct-building", {
            buildingId: BuildingId.Coop,
            position: { x: 1, y: 1 },
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

        // Make the animal sick
        while (animalInfo.currentState !== AnimalCurrentState.Sick) {
            dataSource.manager.update(AnimalInfoEntity, { id: animalInfo.id }, { currentState: AnimalCurrentState.Sick })
        }

        // Helper cures the animal
        const helperAxios = createAxios(AxiosConfigType.WithAuth, { version: ApiVersion.V1, accessToken: helperAccessToken })
        await helperAxios.post("/help-cure-animal", {
            placedItemAnimalId: animalInfo.placedItemId,
            neighborUserId: user.id,
        })

        // Verify the animal is cured
        animalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: animalInfo.id },
        })

        expect(animalInfo.currentState).toBe(AnimalCurrentState.Normal)
    })

    afterAll(async () => {
        await dataSource.manager.delete(UserEntity, user.id)
        await dataSource.manager.delete(UserEntity, helperUser.id)
    })
})
