import { Provider } from "@nestjs/common"
import { KUBECONFIG } from "./kubernetes.constants"
import { KubeConfig } from "@kubernetes/client-node"
import { runInKubernetes } from "@src/env"

export const createKubeConfigFactoryProvider = (): Provider => ({
    provide: KUBECONFIG,
    useFactory: (): KubeConfig => {
        const kubeConfig = new KubeConfig()
        if (runInKubernetes()) {
            //ensure RBAC is configured, and proper role is assigned to the service account
            kubeConfig.loadFromCluster()
        } else {
            kubeConfig.loadFromDefault()
        }
        return kubeConfig
    }
})