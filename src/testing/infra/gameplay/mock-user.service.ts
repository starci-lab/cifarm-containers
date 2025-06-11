import { faker } from "@faker-js/faker"
import { Injectable } from "@nestjs/common"
import { DeepPartial } from "@src/common"
import { InjectMongoose, SessionSchema, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Connection } from "mongoose"
import { v4 } from "uuid"

@Injectable()
export class GameplayMockUserService {
    private users: Array<UserSchema>
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService
    ) {
        this.users = []
    }

    public async clear(): Promise<void> {
        await this.connection.model(UserSchema.name).deleteMany({
            _id: { $in: this.users.map((user) => user.id) }
        })
        this.users = []
    }

    public async generate({
        golds = 5000,
        level = 1,
        energy = 50,
        experiences = 0,
        spinLastTime = this.dateUtcService.getDayjs().subtract(2, "day").toDate(),
        dailyRewardLastClaimTime = this.dateUtcService.getDayjs().subtract(2, "day").toDate(),
        dailyRewardStreak = 0
    }: GenerateParams = {}): Promise<UserSchema> {
        const userPartial: DeepPartial<UserSchema> = {
            username: faker.internet.userName(),
            golds,
            experiences,
            energy,
            level,
            dailyRewardStreak,
            spinCount: faker.number.int({ min: 0, max: 100 }),
            dailyRewardLastClaimTime,
            spinLastTime,
        }
        const user = await this.connection.model<UserSchema>(UserSchema.name).create(userPartial)
        await this.connection.model<SessionSchema>(SessionSchema.name).create({
            refreshToken: v4(),
            expiredAt: this.dateUtcService.getDayjs().add(1, "day").toDate(),
            user: user.id
        })
        this.users.push(user)
        return user
    }
}

export type GenerateParams = Partial<UserSchema>
