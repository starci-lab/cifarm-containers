import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { AvailableInType } from "../enums"

@ObjectType()
@Entity("tools")
export class ToolEntity extends StringAbstractEntity {
    @Field(() => String)
    @Column({ name: "available_in", type: "enum", enum: AvailableInType })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @Column({ name: "index", type: "int" })
        index: number
}
