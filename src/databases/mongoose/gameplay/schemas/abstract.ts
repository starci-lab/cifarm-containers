
import { Field, ObjectType } from "@nestjs/graphql"
import { Prop } from "@nestjs/mongoose"

@ObjectType({
    isAbstract: true
})
export abstract class AbstractSchema {
    @Field(() => Date)
    @Prop({ type: Date })
        createdAt: Date

    @Field(() => Date)
    @Prop({ type: Date })
        updatedAt: Date
}

export abstract class KeyAbstractSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, unique: true })
        key: string
}