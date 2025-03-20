import { CacheKey } from "./types"

export const getCacheKey = (key: CacheKey, id: string) => {
    return `${key}-${id}`
}
    
