import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany } from "typeorm"
import { AbstractEntity } from "./abstract"
import { DailyRewardPossibility } from "./daily-reward-possibility.entity"

@ObjectType()
@Entity("daily_rewards")
export class DailyRewardEntity extends AbstractEntity {
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
