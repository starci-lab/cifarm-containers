export const createResolverFromEnum = (enumType: Record<string, string | number>) => {
    const map: Record<string, string | number> = {}
    Object.entries(enumType).forEach(([key, value]) => {
        if (isNaN(Number(key))) {
            map[key] = value
        }
    }, {} as Record<string, string | number>)
    return map
}