import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { DailyRewardPossibilityEntity } from "./daily-reward-possibility.entity"

@ObjectType()
@Entity("daily_rewards")
export class DailyRewardEntity extends StringAbstractEntity {
    @Field(() => Int, { nullable: true })
    @Column({ name: "reward_amount", type: "int", nullable: true })
        amount: number

    @Field(() => Int)
    @Column({ name: "reward_day", type: "int" })
        day: number

    @Field(() => Boolean)
    @Column({ name: "is_last_day", type: "boolean", default: false })
        isLastDay: boolean

    @Field(() => [DailyRewardPossibilityEntity], { nullable: true })
    @OneToMany(
        () => DailyRewardPossibilityEntity,
        (dailyRewardPossibilities) => dailyRewardPossibilities.dailyReward,
        { cascade: true },
    )
        dailyRewardPossibilities?: Array<DailyRewardPossibilityEntity>
}
