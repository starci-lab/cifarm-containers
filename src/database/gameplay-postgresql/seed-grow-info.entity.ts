import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne } from "typeorm"
import { CropEntity } from "./crop.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { AbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"
import { CropCurrentState } from "./enums"

@ObjectType()
@Entity("seed_growth_info")
export class SeedGrowthInfoEntity extends AbstractEntity {
    @Field(() => String)
    @Column({ type: "enum", enum: CropCurrentState })
        currentStage: CropCurrentState

    @Field(() => Int)
    @Column({ type: "int", nullable: true })
        currentStageTimeElapsed: number

    @Field(() => Int)
    @Column({ type: "int", nullable: true })
        totalTimeElapsed: number

    @Field(() => Int)
    @Column({ name: "current_perennial_count", type: "int4" })
        currentPerennialCount: number

    @Field(() => Int)
    @Column({ type: "int", nullable: true })
        harvestQuantityRemaining: number

    @Field(() => CropEntity)
    @ManyToOne(() => CropEntity, { nullable: true, eager: true })
        crop: CropEntity

    @Field(() => Int)
    @Column({ type: "int", nullable: true })
        currentState: number

    @ManyToMany(() => UserEntity)
    @JoinTable()
        thiefedBy: Array<UserEntity>

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
        fullyMatured: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
        isFertilized: boolean

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.seedGrowthInfo, {
        onDelete: "CASCADE"
    })
        placedItem?: PlacedItemEntity
}
