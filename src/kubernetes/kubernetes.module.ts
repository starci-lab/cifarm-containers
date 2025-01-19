import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./kubernetes.module-definition"
import { NestExport, NestProvider } from "@src/common"
import { createKubeConfigFactoryProvider } from "./kube-config.providers"
import { LeaderElectionService } from "./leader-election"

@Module({})
export class KubernetesModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)

        // if leader election is enabled
        const leaderElectionEnabled = options.leaderElection && (options.leaderElection.enabled ?? true) 

        const kubeConfigProvider = createKubeConfigFactoryProvider()

        const providers: Array<NestProvider> = [kubeConfigProvider]
        const exports: Array<NestExport> = [kubeConfigProvider]

        if (leaderElectionEnabled) {
            // do something
            providers.push(LeaderElectionService)
            exports.push(LeaderElectionService)
        }
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}