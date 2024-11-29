import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { DailyRewardEntity } from "./daily-reward.entity"

@ObjectType()
@Entity("daily_reward_possibilities")
export class DailyRewardPossibilityEntity extends ReadableAbstractEntity{
    @Field(() => Int, { nullable: true })
    @Column({ name: "gold_amount", type: "int", nullable: true })
        goldAmount?: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "token_amount", type: "int", nullable: true })
        tokenAmount?: number

    @Field(() => Float)
    @Column({ name: "threshold_min", type: "float" })
        thresholdMin: number

    @Field(() => Float)
    @Column({ name: "threshold_max", type: "float" })
        thresholdMax: number

    @ManyToOne(() => DailyRewardEntity, (dailyReward) => dailyReward.dailyRewardPossibilities, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "daily_reward_id",
        referencedColumnName: "id"
    })
        dailyReward: DailyRewardEntity
}
