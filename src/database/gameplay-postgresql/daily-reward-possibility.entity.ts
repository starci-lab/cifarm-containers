import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';

@ObjectType()
@Entity('daily_reward_possibilities')
export class DailyRewardPossibility {

    @Field(() => Int, { nullable: true })
    @Column({ name: 'gold_amount', type: 'int', nullable: true })
    goldAmount?: number;

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
