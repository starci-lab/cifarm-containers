import { faker } from "@faker-js/faker"
import { Injectable } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Network, SupportedChainKey } from "@src/env"
import { DataSource, DeepPartial, In } from "typeorm"
import { v4 } from "uuid"

@Injectable()
export class GameplayMockUserService {
    private users: Array<UserEntity>
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService
    ) {
        this.users = []
    }

    public async clear(): Promise<void> {
        await this.dataSource.manager.delete(UserEntity, {
            id: In(this.users.map((user) => user.id))
        })
    }

    public async generate({
        golds = 500,
        tokens = 100,
        level = 1,
        energy = 50,
        experiences = 0,
        spinLastTime = this.dateUtcService.getDayjs().subtract(2, "day").toDate(),
        dailyRewardLastClaimTime = this.dateUtcService.getDayjs().subtract(2, "day").toDate(),
        dailyRewardStreak = 0
    }: GenerateParams = {}): Promise<UserEntity> {
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
            dailyRewardStreak,
            dailyRewardNumberOfClaim: faker.number.int({ min: 0, max: 30 }),
            spinCount: faker.number.int({ min: 0, max: 100 }),
            dailyRewardLastClaimTime,
            spinLastTime,
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

export type GenerateParams = DeepPartial<UserEntity>
