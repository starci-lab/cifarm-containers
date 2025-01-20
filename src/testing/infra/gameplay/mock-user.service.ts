import { faker } from "@faker-js/faker"
import { Injectable } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity } from "@src/databases"
import { Network, SupportedChainKey } from "@src/env"
import { DataSource, DeepPartial, In } from "typeorm"
import { v4 } from "uuid"

@Injectable()
export class GameplayMockUserService {
    private users: Array<UserEntity>
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {
        this.users = []
    }

    public async clear(): Promise<void> {
        await this.dataSource.manager.delete(UserEntity, {
            id: In(this.users.map((user) => user.id))
        })
    }

    public async generate({ golds = 500, tokens = 100, level = 1, energy = 50, experiences = 0 }: GenerateParams = {}): Promise<UserEntity> {
        const userPartial: DeepPartial<UserEntity> = {
            username: faker.internet.username(),
            chainKey: faker.helpers.arrayElement(Object.values(SupportedChainKey)),
            network: faker.helpers.arrayElement(Object.values(Network)),
            accountAddress: faker.finance.ethereumAddress(),
            golds,
            tokens,
            experiences,
            energy,
            level,
            tutorialIndex: faker.number.int({ min: 0, max: 10 }),
            stepIndex: faker.number.int({ min: 0, max: 10 }),
            dailyRewardStreak: faker.number.int({ min: 0, max: 7 }),
            dailyRewardNumberOfClaim: faker.number.int({ min: 0, max: 30 }),
            spinCount: faker.number.int({ min: 0, max: 100 }),
            dailyRewardLastClaimTime: faker.date.recent(),
            spinLastTime: faker.date.recent(),
            sessions: [
                {
                    refreshToken: v4(),
                    expiredAt: faker.date.future()
                }
            ]
        }
        const user = await this.dataSource.manager.save(UserEntity, userPartial)
        this.users.push(user)
        return user
    }
}

export interface GenerateParams {
    golds?: number
    tokens?: number
    level?: number
    energy?: number
    experiences?: number
}
