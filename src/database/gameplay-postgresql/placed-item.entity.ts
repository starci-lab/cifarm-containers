import { Field, ObjectType } from "@nestjs/graphql"
import {
    Column,
    Entity,
} from "typeorm"
import { AbstractEntity } from "./abstract"

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


    @Field(() => String)
    @Column({ name: "item_key", type: "text" })
        itemKey: string
}