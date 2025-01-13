import { faker } from "@faker-js/faker"
import { Injectable } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity } from "@src/databases"
import { PostgreSQLContext, SupportedChainKey } from "@src/env"
import { Network } from "ethers"
import { DataSource, DeepPartial, In } from "typeorm"

@Injectable()
export class GameplayMockUserService {
    private users: Array<UserEntity>
    constructor(
        @InjectPostgreSQL({
            context: PostgreSQLContext.Mock,
        })
        private readonly dataSource: DataSource
    ) {
        this.users = []
    }

    public async clear(): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            await queryRunner.manager.delete(UserEntity, {
                id: In(this.users.map((user) => user.id))
            })
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    }

    public async generate(): Promise<DeepPartial<UserEntity>> {
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
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const newUser = await queryRunner.manager.save(UserEntity, user)
            await queryRunner.commitTransaction()
            this.users.push(newUser)
            return newUser
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    }
}
