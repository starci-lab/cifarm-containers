import { Field, ObjectType } from "@nestjs/graphql"
import {
    Column,
    Entity,
} from "typeorm"
import { AbstractEntity } from "./abstract"

@ObjectType()
@Entity("inventories")
export class InventoriesEntity extends AbstractEntity {
  @Field(() => String)
  @Column({ name: "quantity", type: "int", default: 1 })
      quantity: string
}