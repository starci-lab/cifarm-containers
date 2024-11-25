export * from "./gold.module"
export * from "./gold.service"

import {
    AddRequest as AddGoldRequest,
    AddResponse as AddGoldResponse,
    SubtractRequest as SubtractGoldRequest,
    SubtractResponse as SubtractGoldResponse
} from "./gold.dto"

export { AddGoldRequest, AddGoldResponse, SubtractGoldRequest, SubtractGoldResponse }
