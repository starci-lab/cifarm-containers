import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./leader-election.module-definition"
import { LeaderElectionService } from "./leader-election.service"
import { EventEmitterModule } from "@nestjs/event-emitter"

@Module({
    imports: [EventEmitterModule.forRoot()],
    providers: [LeaderElectionService],
    exports: [LeaderElectionService]
})
export class LeaderElectionModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.forRoot(options)
    }
}
