import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { DailyRewardEntity } from "./daily-reward.entity"
import { DailyRewardPossibilityKey } from "./enums-key"

@ObjectType()
@Entity("daily_reward_possibilities")
export class DailyRewardPossibility extends ReadableAbstractEntity{
    @Field(() => DailyRewardPossibilityKey)
    @PrimaryColumn({ type: "enum", enum: DailyRewardPossibilityKey })
        key: DailyRewardPossibilityKey
        
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
    @JoinColumn()
        dailyReward: DailyRewardEntity
}
