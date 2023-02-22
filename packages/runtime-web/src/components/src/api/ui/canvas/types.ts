export type CanvasElement = Partial<HTMLCanvasElement>
export type CreatePatternRepeatType =
  | 'repeat'
  | 'repeat-x'
  | 'repeat-y'
  | 'no-repeat'
export type LineCapType = 'butt' | 'round' | 'square'
export type LineJoinType = 'round' | 'bevel' | 'miter'

export interface CanvasActionVo {
  action: string
  args?: Array<any>
  value?: any
  reserve?: false
  id?: string
  group?: Array<any>
}
