import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AvailableInType, ToolType } from "./enums"

@ObjectType()
@Entity("tools")
export class ToolEntity extends AbstractEntity {
    @Field(() => ToolType)
    @Column({ name: "type", type: "enum", enum: ToolType })
        type: ToolType
    
    @Field(() => AvailableInType)
    @Column({ name: "available_in", type: "enum", enum: AvailableInType })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @Column({ name: "index", type: "int" })
        index: number
}
