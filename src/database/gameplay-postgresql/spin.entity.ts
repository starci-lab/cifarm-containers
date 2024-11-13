import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, PrimaryColumn } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { SpinType } from "./enums"
import { SpinKey } from "./enums-key"

@ObjectType()
@Entity("spins")
export class SpinEntity extends ReadableAbstractEntity {
    @Field(() => SpinKey)
    @PrimaryColumn({ type: "enum", enum: SpinKey })
        id: SpinKey

    @Field(() => SpinType)
    @Column({ name: "spin_type", type: "enum", enum: SpinType })
        type: SpinType

    @Field(() => Int, { nullable: true })
    @Column({ name: "gold_amount", type: "int", nullable: true })
        goldAmount?: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "quantity", type: "int", nullable: true })
        quantity?: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "token_amount", type: "int", nullable: true })
        tokenAmount?: number

    @Field(() => Float)
    @Column({ name: "threshold_min", type: "float" })
        thresholdMin: number

    @Field(() => Float)
    @Column({ name: "threshold_max", type: "float" })
        thresholdMax: number
}
