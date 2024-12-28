import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { CropEntity } from "./crop.entity"
import { AppearanceChance, SpinPrizeType } from "../enums"
import { SupplyEntity } from "./supply.entity"
import { SpinSlotEntity } from "./spin-slot.entity"

@ObjectType()
@Entity("spin_prizes")
export class SpinPrizeEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: SpinPrizeType })
        type: SpinPrizeType

    @Field(() => String, { nullable: true })
    @Column({ name: "crop_id", nullable: true })
        cropId?: string

    @Field(() => CropEntity, { nullable: true })
    @ManyToOne(() => CropEntity, (crop) => crop.spinPrizes, { nullable: true })
    @JoinColumn({
        name: "crop_id",
        referencedColumnName: "id"
    })
        crop?: CropEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "supply_id", nullable: true })
        supplyId: string

    @ManyToOne(() => SupplyEntity, (supply) => supply.spinPrizes, { nullable: true })
    @JoinColumn({
        name: "supply_id",
        referencedColumnName: "id"
    })
        supply: SupplyEntity

    @Field(() => Int, { nullable: true })
    @Column({ name: "golds", type: "int", nullable: true })
        golds: number
    
    @Field(() => Float, { nullable: true })
    @Column({ name: "tokens", type: "float", nullable: true })
        tokens: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "quantity", type: "int", nullable: true })
        quantity?: number

    @Field(() => String, { nullable: true })
    @Column({ name: "appearance_chance", type: "enum", enum: AppearanceChance })
        appearanceChance: AppearanceChance

    @Field(() => [SpinSlotEntity], { nullable: true })
    @OneToMany(() => SpinSlotEntity, (spin) => spin.spinPrize, {
        cascade: ["insert", "update"]
    })
        spinSlots?: Array<SpinSlotEntity>
}

