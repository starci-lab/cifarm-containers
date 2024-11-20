import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"
import { InventoryType } from "./enums"

@ObjectType()
@Entity("inventories")
export class InventoryEntity extends AbstractEntity {
    @Field(() => String)
    @Column({ name: "quantity", type: "int", default: 1 })
    quantity: number

    @Field(() => String)
    @Column({ name: "reference_key", type: "varchar", length: 100 })
    referenceKey: string

    @Field(() => UserEntity)
    @Index()
    @Column({ name: "user_id", type: "uuid" })
    userId: string

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => user.inventories, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: UserEntity

    @Field(() => InventoryType)
    @Column({ name: "type", type: "enum", enum: InventoryType })
    type: InventoryType

    @Field(() => String, { nullable: true })
    @Column({ name: "token_id", type: "varchar", length: 100, nullable: true })
    tokenId?: string

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "placeable", type: "boolean", default: false })
    placeable: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "is_placed", type: "boolean", default: false })
    isPlaced: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "premium", type: "boolean", default: false })
    premium: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "deliverable", type: "boolean", default: false })
    deliverable: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "as_tool", type: "boolean", default: false })
    asTool: boolean

    // limit the maximum stack size
    @Field(() => Number, { defaultValue: 16 })
    @Column({ name: "max_stack", type: "int", default: 16 })
    maxStack: number
}
