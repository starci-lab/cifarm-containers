import { DynamicModule, Global, Module } from "@nestjs/common"
import { DEFAULT_LEASE_NAME, DEFAULT_LOG_AT_LEVEL, LEADER_ELECTION_OPTIONS, RENEWAL_INTERVAL } from "./leader-election.constants"
import { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, OPTIONS_TYPE } from "./leader-election.module-definition"
import { LeaderElectionService } from "./leader-election.service"

@Global()
@Module({})
export class LeaderElectionModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {
    }): DynamicModule {
        return {
            module: LeaderElectionModule,
            providers: [
                {
                    provide: LEADER_ELECTION_OPTIONS,
                    useValue: {
                        leaseName: DEFAULT_LEASE_NAME,
                        renewalInterval: RENEWAL_INTERVAL,
                        logAtLevel: DEFAULT_LOG_AT_LEVEL,
                        awaitLeadership: true,
                        ...options,
                    },
                },
                LeaderElectionService,
            ],
            exports: [LeaderElectionService],
        }
    }

    static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE = {}): DynamicModule {
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


