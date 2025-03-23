import { Injectable } from "@nestjs/common"
import _ from "lodash"
// object service
@Injectable()
export class ObjectService {
    constructor() {}

    private _getDifferenceBetweenObjects<TObject extends object>(
        object1: TObject,
        object2: TObject,
        options: ObjectDifferenceOptions = {},
        isRoot: boolean = true
    ) {
        const object1Keys = Object.keys(object1)
        const object2Keys = Object.keys(object2)
        // get all keys, duplicates are removed
        const allKeys = [...new Set([...object1Keys, ...object2Keys])]
        const object = allKeys.reduce((diffObj, key) => {
            // If the key doesn't exist in object2, return null
            if (!_.has(object2, key)) {
                // use null to indicate that the key is not present in object2
                diffObj[key] = null
            } else if (_.isPlainObject(object1[key]) && _.isPlainObject(object2[key])) {
                // If both values are objects, recurse
                const nestedDiff = this._getDifferenceBetweenObjects(object1[key], object2[key], options, false)
                if (!_.isEmpty(nestedDiff)) {
                    diffObj[key] = nestedDiff
                }
                // if object 1 is an object, and object 2 is undefined, return null
            } else if (_.isPlainObject(object1[key]) && object2[key] === undefined) {
                diffObj[key] = null
                // if object 1 is undefined, and object 2 is an object, return the object
            } else if (object1[key] === undefined && _.isPlainObject(object2[key])) {
                diffObj[key] = object2[key]
            } else if (!_.isEqual(object1[key], object2[key])) {
                // If values are not equal, add them to the diff result
                diffObj[key] = object2[key]
            }
            return diffObj
        }, {} as Partial<TObject>)

        if (options.excludeKey && isRoot && !_.isEmpty(object)) {
            return {
                ...object,
                [options.excludeKey]: object1[options.excludeKey]
            }
        }
        return object
    }

    public getDifferenceBetweenObjects<TObject extends object>(
        object1: TObject,
        object2: TObject,
        options: ObjectDifferenceOptions = {}
    ): Partial<TObject> {
        return this._getDifferenceBetweenObjects(object1, object2, options)
    }

    /**
     * Get the differences between two arrays of objects, with deep comparison.
     * If an object in array1 doesn't exist in array2, it returns `undefined`.
     */
    public getDifferenceBetweenArrays<TObject extends object>(
        array1: Array<TObject>,
        array2: Array<TObject>,
        options: ObjectDifferenceOptions = {}
    ): Array<Partial<TObject>> {
        const maxLength = Math.max(array1.length, array2.length)

        return Array.from({ length: maxLength })
            .map((_, index) => {
                const obj1 = array1[index]
                const obj2 = array2[index]

                // If either object is missing, throw an error
                if (!obj1) throw new Error("Object 1 is missing")
                if (!obj2) throw new Error("Object 2 is missing")

                // Use getDifferenceBetweenObjects to compare objects at the same index
                const diff = this._getDifferenceBetweenObjects(obj1, obj2, options)
                if (Object.keys(diff).length > 0) {
                    return diff
                }

                return null // No differences
            })
            .filter((item) => item !== null) // Remove null values where there's no difference
    }
}

export interface ObjectDifferenceOptions {
    //exclude keys from the comparison, use the main object only
    excludeKey?: string
}
