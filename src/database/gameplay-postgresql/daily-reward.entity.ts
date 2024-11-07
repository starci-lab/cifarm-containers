import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract';
import { DayType } from './enums';
import { DailyRewardPossibility } from './daily-reward-possibility.entity';

@ObjectType()
@Entity('daily_rewards')
export class DailyRewardEntity extends AbstractEntity {
    @Field(() => DayType)
    @Column({ name: 'day_type', type: 'enum', enum: DayType })
        dayType: DayType;

    @Field(() => Int)
    @Column({ name: 'reward_amount', type: 'int' })
        amount: number;

    @Field(() => Int)
    @Column({ name: 'reward_day', type: 'int' })
        day: number;

    @Field(() => Boolean)
    @Column({ name: 'is_last_day', type: 'boolean', default: false })
        isLastDay: boolean;

    @Field(() => [DailyRewardPossibility], { nullable: true })
    @Column({ name: 'daily_reward_possibilities', type: 'simple-json', nullable: true })
        dailyRewardPossibilities?: Array<DailyRewardPossibility>;
}
