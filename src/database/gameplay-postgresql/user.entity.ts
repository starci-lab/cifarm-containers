import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany } from "typeorm"
import { AbstractEntity } from "./abstract"
import { SupportedChainKey } from "@src/config"
import { Network } from "@src/config"
import { InventoryEntity } from "./inventory.entity"

@ObjectType()
@Entity("users")
export class UserEntity extends AbstractEntity {
  @Field(() => String)
  @Column({ name: "username", type: "varchar", length: 50 })
      username: string
  
  @Field(() => String)
  @Column({ name: "chainKey", type: "varchar", length: 50 })
      chainKey: SupportedChainKey

  @Field(() => String)
  @Column({ name: "network", type: "varchar", length: 50 })
      network: Network

  @Field(() => String)
  @Column({ name: "account_address", type: "varchar", length: 100 })
      accountAddress: string

  @Field(() => [InventoryEntity])
  @OneToMany(() => InventoryEntity, (inventory) => inventory.user)
      inventories?: Array<InventoryEntity>
}
