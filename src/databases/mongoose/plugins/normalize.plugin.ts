/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, Document } from "mongoose"

// Define types for the schema options
interface NormalizeMongooseOptions {
  normalizeId?: boolean;
  removeVersion?: boolean;
  removePrivatePaths?: boolean;
  toJSON?: {
    transform?: (doc: Document, returnValue: any, options: any) => any;
  };
}

type SchemaType = Schema & { options: NormalizeMongooseOptions };

export const normalizeMongoose = (schema: SchemaType): void => {
    const {
        toJSON,
        normalizeId,
        removeVersion,
        removePrivatePaths,
        toJSON: { transform } = {},
    } = schema.options

    const json = {
        transform(doc: Document, returnValue: any, options: any): void {
            if (!removePrivatePaths) {
                const { paths } = schema

                for (const path in paths) {
                    if (paths[path].options?.private && returnValue[path]) {
                        delete returnValue[path]
                    }
                }
            }

            if (!removeVersion) {
                const { __v } = returnValue

                if (__v === undefined) {
                    delete returnValue.__v
                }
            }

            if (!normalizeId) {
                const { _id, id } = returnValue

                if (_id && !id) {
                    returnValue.id = _id.toString()
                    delete returnValue._id
                }
            }

            if (transform) {
                return transform(doc, returnValue, options)
            }
        },
    }

    schema.options.toJSON = { ...toJSON, ...json }
}
