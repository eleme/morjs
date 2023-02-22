export interface IHash<T> {
  [name: string]: T
}

export type Json = IHash<string | number | boolean | Date | Json | JsonArray>

export type JsonArray = (string | number | boolean | Date | Json | JsonArray)[]

export type JsonValue = Json[keyof Json]

export type MaybeArray<T> = T | T[]

export type MaybePromise<T> = T | Promise<T>

export type AnyFunc = (...args: any[]) => any

export type UserConfig = Record<string, any>

export type ConstEnumValues = readonly [string, ...string[]]

export type ConstObject<T extends ConstEnumValues> = {
  [k in T[number]]: k
}

export type ObjectValues<T> = T extends { [k: string]: infer U } ? U : never
