import { Field, ObjectType } from "@nestjs/graphql"
import { Column, ManyToOne } from "typeorm"
import { AnimalEntity } from "./animal.entity"

@ObjectType()
export class AnimalInfoEntity {
    @Field(() => Number)
    @Column({ type: "bigint", nullable: true })
    currentGrowthTime: number

    @Field(() => Number)
    @Column({ type: "bigint", nullable: true })
    currentHungryTime: number

    @Field(() => Number)
    @Column({ type: "bigint", nullable: true })
    currentYieldTime: number

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    hasYielded: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    isAdult: boolean

    @Field(() => AnimalEntity)
    @ManyToOne(() => AnimalEntity, { nullable: true, eager: true })
    animal: AnimalEntity

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    currentState: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    harvestQuantityRemaining: number

    @Field(() => [String])
    @Column({ type: "simple-array", nullable: true })
    thiefedBy: string[]

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    alreadySick: boolean
}
