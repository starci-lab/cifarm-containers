import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract';
import { SpinType } from './enums';

@ObjectType()
@Entity('spins')
export class SpinEntity extends AbstractEntity {
    @Field(() => SpinType)
    @Column({ name: 'spin_type', type: 'enum', enum: SpinType })
    type: SpinType;

    @Field(() => Int, { nullable: true })
    @Column({ name: 'gold_amount', type: 'int', nullable: true })
    goldAmount?: number;

    @Field(() => Int, { nullable: true })
    @Column({ name: 'quantity', type: 'int', nullable: true })
    quantity?: number;

    @Field(() => Int, { nullable: true })
    @Column({ name: 'token_amount', type: 'int', nullable: true })
    tokenAmount?: number;

    @Field(() => Float)
    @Column({ name: 'threshold_min', type: 'float' })
    thresholdMin: number;

    @Field(() => Float)
    @Column({ name: 'threshold_max', type: 'float' })
    thresholdMax: number;
}
