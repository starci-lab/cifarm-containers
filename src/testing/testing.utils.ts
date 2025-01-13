import { ModuleMetadata } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { TestContext } from "./testing.types"
import { TestingModule } from "./testing.module"
export const createTestModule = async (metadata: ModuleMetadata, context?: TestContext) => {
    context = context || TestContext.Gameplay
    const module = await Test.createTestingModule({
        ...metadata,
        imports: [
            TestingModule.register({
                context
            }),
            ...metadata.imports
        ]
    }).compile()

    return { module }
}
