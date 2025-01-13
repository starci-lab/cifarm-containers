import { faker } from "@faker-js/faker"
import { Injectable } from "@nestjs/common"
import { UserEntity } from "@src/databases"
import { Network, SupportedChainKey } from "@src/env"
import { DeepPartial } from "typeorm"

@Injectable()
export class TestingService {
    public test() {
        console.log("testing service")
        return "testing service"
    }

    public generateMockUserForGameplay(): DeepPartial<UserEntity> {
        const user: DeepPartial<UserEntity> = {
            username: faker.internet.userName(),
            chainKey: faker.helpers.arrayElement(Object.values(SupportedChainKey)),
            network: faker.helpers.arrayElement(Object.values(Network)),
            accountAddress: faker.finance.ethereumAddress(),
            golds: faker.number.int({ min: 0, max: 1000 }),
            tokens: faker.number.float({ min: 0, max: 5000 }),
            experiences: faker.number.int({ min: 0, max: 10000 }),
            energy: faker.number.int({ min: 0, max: 100 }),
            energyRegenTime: faker.number.float({ min: 0, max: 3600 }),
            level: faker.number.int({ min: 1, max: 50 }),
            tutorialIndex: faker.number.int({ min: 0, max: 10 }),
            stepIndex: faker.number.int({ min: 0, max: 10 }),
            dailyRewardStreak: faker.number.int({ min: 0, max: 7 }),
            dailyRewardNumberOfClaim: faker.number.int({ min: 0, max: 30 }),
            spinCount: faker.number.int({ min: 0, max: 100 }),
            visitingUserId: faker.string.uuid(),
            dailyRewardLastClaimTime: faker.date.recent(),
            spinLastTime: faker.date.recent(),
            isRandom: faker.datatype.boolean()
        }

        return user
    }
}
