import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, PrimaryColumn } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { AvailableInType } from "./enums"
import { ToolKey } from "./enums-key"

@ObjectType()
@Entity("tools")
export class ToolEntity extends ReadableAbstractEntity {
    @Field(() => ToolKey)
    @PrimaryColumn({ type: "enum", enum: ToolKey })
        id: ToolKey
    
    @Field(() => AvailableInType)
    @Column({ name: "available_in", type: "enum", enum: AvailableInType })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @Column({ name: "index", type: "int" })
        index: number
}
