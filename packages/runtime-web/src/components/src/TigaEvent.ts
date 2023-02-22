export interface TigaEventInit<T = any> extends EventInit {
  detail?: T
  other?: object
}

export class TiGaEvent<T> extends Event {
  detail: T
  other: object
  constructor(typeArg: string, eventInitDict?: TigaEventInit<T>) {
    super(typeArg, eventInitDict)
    this.detail = eventInitDict.detail
    this.other = eventInitDict.other
    if (this.other) {
      Object.assign(this, this.other)
    }
  }
}
