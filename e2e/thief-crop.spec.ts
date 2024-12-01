import { Test } from "@nestjs/testing"
import { authAxios, gameplayAxios, Network, SupportedChainKey } from "@src/config"
import { CropId, UserEntity } from "@src/database"
import { configForRoot, typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { DataSource } from "typeorm"

describe("Theif crop flow", () => {
    let accessToken: string
    let dataSource: DataSource
    let user: UserLike
    let jwtService: JwtService

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                configForRoot(),
                typeOrmForRoot(),
                typeOrmForFeature(),
                JwtModule
            ],
        }).compile()
        //sign in
        //get mesasge
        const { data } = await authAxios().post("/test-signature", {
            chainKey: SupportedChainKey.Avalanche,
            accountNumber: 1,
            network: Network.Testnet,
        })
        const { data: verifySignatureData } = await authAxios().post("/verify-signature", data)
        
        accessToken = verifySignatureData.accessToken
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
        
        //decode accessToken to get user
        user = await jwtService.decodeToken(accessToken)
    })

    it("Should theif flow success", async () => {
        const axios = gameplayAxios(accessToken)
        
        //buy seeds from the shop
        await axios.post("/buy-seeds", {
            cropId: CropId.Carrot,
            quantity: 1,
        })

        //plant the seeds
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, user)
    })
}
)