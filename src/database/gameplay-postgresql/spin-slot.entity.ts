import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { SpinPrizeEntity } from "./spin-prize.entity"

@ObjectType()
@Entity("spin_slots")
export class SpinSlotEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "spin_prize_id", type: "uuid", nullable: false })
        spinPrizeId: string 

    @Field(() => SpinPrizeEntity, { nullable: true })
    @ManyToOne(() => SpinPrizeEntity, (spinPrize) => spinPrize.spinSlots, {
        onDelete: "CASCADE",
        eager: true 
    })
    @JoinColumn({ name: "spin_prize_id", referencedColumnName: "id" })
        spinPrize: SpinPrizeEntity
}
