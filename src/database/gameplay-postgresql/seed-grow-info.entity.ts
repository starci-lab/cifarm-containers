import { Field, ObjectType } from "@nestjs/graphql"
import { Column, ManyToOne } from "typeorm"
import { CropEntity } from "./crop.entity"

@ObjectType()
export class SeedGrowthInfoEntity {
    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    currentStage: number

    @Field(() => Number)
    @Column({ type: "bigint", nullable: true })
    currentStageTimeElapsed: number

    @Field(() => Number)
    @Column({ type: "bigint", nullable: true })
    totalTimeElapsed: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    harvestQuantityRemaining: number

    @Field(() => CropEntity)
    @ManyToOne(() => CropEntity, { nullable: true, eager: true })
    crop: CropEntity

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    currentState: number

    @Field(() => [String])
    @Column({ type: "simple-array", nullable: true })
    thiefedBy: string[]

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    fullyMatured: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    isPlanted: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
    isFertilized: boolean
}
