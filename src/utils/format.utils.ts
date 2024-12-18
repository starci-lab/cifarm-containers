export const createCacheKey = (key: string, group: string) => {
    return `${group}:${key}`
}

export const retriveCacheKey = (rawKey: string, group: string) => {
    return rawKey.replace(`${group}:`, "")
}   