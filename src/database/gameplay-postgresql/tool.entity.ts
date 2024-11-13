import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AvailableInType } from "./enums"
import { ToolKey } from "./enums-key"

@ObjectType()
@Entity("tools")
export class ToolEntity extends AbstractEntity {
    @Field(() => ToolKey)
    @Column({ name: "type", type: "enum", enum: ToolKey })
        type: ToolKey
    
    @Field(() => AvailableInType)
    @Column({ name: "available_in", type: "enum", enum: AvailableInType })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @Column({ name: "index", type: "int" })
        index: number
}
