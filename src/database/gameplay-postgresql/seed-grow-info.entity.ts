import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne } from "typeorm"
import { CropEntity } from "./crop.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { AbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"
import { CropCurrentState } from "./enums"

@ObjectType()
@Entity("seed_growth_info")
export class SeedGrowthInfoEntity extends AbstractEntity {
    @Field(() => Int)
    @Column({ type: "int4", name: "current_stage", default: 1 })
        currentStage: number

    @Field(() => Int)
    @Column({ type: "int", name: "current_stage_time_elapsed", default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Int)
    @Column({ type: "int", name: "total_time_elapsed", default: 0 })
        totalTimeElapsed: number

    @Field(() => Int)
    @Column({ name: "current_perennial_count", type: "int4", default: 1 })
        currentPerennialCount: number

    @Field(() => Int)
    @Column({ type: "int", name: "harvest_quantity_remaining" })
        harvestQuantityRemaining: number

    @Field(() => String)
    @Column({ name: "crop_id", length: 36 })
        cropId: string

    @Field(() => CropEntity)
    @ManyToOne(() => CropEntity)
    @JoinColumn({ name: "crop_id", referencedColumnName: "id" })
        crop: CropEntity

    @Index()
    @Field(() => String)
    @Column({ type: "enum", enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @ManyToMany(() => UserEntity) 
    @JoinTable()
        thiefedBy: Array<UserEntity>

    @Index()
    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
        fullyMatured: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
        isFertilized: boolean

    @Field(() => String)
    @Column({ name: "placed_item_id", type: "uuid" })
        placedItemId: string

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.seedGrowthInfo, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "placed_item_id",
        referencedColumnName: "id"
    })
        placedItem?: PlacedItemEntity
}
