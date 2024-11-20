import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("placed_items")
export class PlacedItemEntity extends AbstractEntity {
    @Field(() => String)
    @Column({ name: "quantity", type: "int", default: 1 })
    quantity: string

    @Field(() => String)
    @Column({ name: "x", type: "int" })
    x: string

    @Field(() => String)
    @Column({ name: "y", type: "int" })
    y: string

    @Field(() => UserEntity)
    @Index()
    @Column({ name: "user_id", type: "uuid" })
    userId: string

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => user.placedItems, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: UserEntity

    @Field(() => String)
    @Column({ name: "item_key", type: "varchar" })
    itemKey: string
}
