/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamicModule, Module, Global } from "@nestjs/common"
import { LeaderElectionOptions } from "./leader-election.types"
import { LeaderElectionService } from "./leader-election.service"
import { LEADER_ELECTION_OPTIONS } from "./leader-election.constants"

@Global()
@Module({})
export class LeaderElectionModule {
    static forRoot(options: LeaderElectionOptions): DynamicModule {
        return {
            module: LeaderElectionModule,
            providers: [
                {
                    provide: LEADER_ELECTION_OPTIONS,
                    useValue: options,
                },
                LeaderElectionService,
            ],
            exports: [LeaderElectionService],
        }
    }

    static forRootAsync(options: {
        useFactory: (...args: any[]) => Promise<LeaderElectionOptions> | LeaderElectionOptions;
        inject?: any[];
    }): DynamicModule {
        return {
            module: LeaderElectionModule,
            providers: [
                {
                    provide: LEADER_ELECTION_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                LeaderElectionService,
            ],
            exports: [LeaderElectionService],
        }
    }
}


