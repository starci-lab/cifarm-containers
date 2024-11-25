export * from "./gold.module"
export * from "./gold.service"

import {
    AddParams as AddGoldParams,
    AddResult as AddGoldAddResult,
    SubtractParams as SubtractGoldParams,
    SubtractResult as SubtractGoldResult
} from "./gold.dto"

export { AddGoldParams, AddGoldAddResult, SubtractGoldParams, SubtractGoldResult }
