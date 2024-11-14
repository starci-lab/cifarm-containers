import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from "typeorm"
import { AbstractEntity, ReadableAbstractEntity } from "./abstract"
import { DailyRewardPossibility } from "./daily-reward-possibility.entity"
import { DailyRewardKey } from "./enums-key"

@ObjectType()
@Entity("daily_rewards")
export class DailyRewardEntity extends ReadableAbstractEntity {
    @Field(() => DailyRewardKey)
    // @PrimaryColumn({name:"id", type: "enum", enum: DailyRewardKey })
    @PrimaryColumn({name:"id", type: "varchar" })
        id: DailyRewardKey

    @Field(() => Int, { nullable: true })
    @Column({ name: "reward_amount", type: "int", nullable: true })
        amount: number

    @Field(() => Int)
    @Column({ name: "reward_day", type: "int" })
        day: number

    @Field(() => Boolean)
    @Column({ name: "is_last_day", type: "boolean", default: false })
        isLastDay: boolean

    @Field(() => [DailyRewardPossibility], { nullable: true })
    @OneToMany(() => DailyRewardPossibility, (dailyRewardPossibilities) => dailyRewardPossibilities.dailyReward, { cascade: true, eager: true })
    @JoinColumn()
        dailyRewardPossibilities?: Array<DailyRewardPossibility>
}
