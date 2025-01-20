import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne } from "typeorm"
import { PlacedItemEntity } from "./placed-item.entity"
import { UuidAbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"
import { CropCurrentState } from "../enums"
import { CropEntity } from "./crop.entity"

@ObjectType()
@Entity("seed_growth_info")
export class SeedGrowthInfoEntity extends UuidAbstractEntity {
    @Field(() => Int)
    @Column({ type: "int4", name: "current_stage", default: 1 })
        currentStage: number

    @Field(() => Float)
    @Column({ type: "float", name: "current_stage_time_elapsed", default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Float)
    @Column({ type: "float", name: "total_time_elapsed", default: 0 })
        totalTimeElapsed: number

    @Field(() => Int)
    @Column({ name: "current_perennial_count", type: "int4", default: 0 })
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
