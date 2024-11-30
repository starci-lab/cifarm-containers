import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { StringAbstractEntity } from "./abstract"

@ObjectType()
@Entity("daily_rewards")
export class DailyRewardEntity extends StringAbstractEntity {
    @Field(() => Int, { nullable: true })
    @Column({ name: "golds", type: "int", nullable: true })
        golds: number

    // Extra tokens, only claim in last day
    @Field(() => Float, { nullable: true })
    @Column({ name: "tokens", type: "float", nullable: true })
        tokens: number

    @Field(() => Int)
    @Column({ name: "reward_day", type: "int" })
        day: number

    @Field(() => Boolean)
    @Column({ name: "last_day", type: "boolean", default: false })
        lastDay: boolean
}
