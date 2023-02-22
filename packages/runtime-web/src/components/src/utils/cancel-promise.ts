const CancelError = new Error('canceled')

export function makeCancelPromise<T>(
  p: Promise<T>,
  onCancel?: () => void
): CancelPromise {
  let _reject
  let isDone = false
  const cancelP: CancelPromise = new Promise<T>((resolve, reject) => {
    _reject = reject
    p.then(
      (data) => {
        isDone = true
        resolve(data)
      },
      (err) => {
        isDone = true
        reject(err)
      }
    )
  })
  cancelP.cancel = function () {
    if (!isDone) {
      _reject(CancelError)
      if (onCancel) {
        onCancel()
      }
    }
  }
  cancelP.__cancelpromise__ = true
  return cancelP
}

export function isCancelPromise(p: CancelPromise): boolean {
  return !!p.__cancelpromise__
}

export function isCancel(err) {
  return err === CancelError
}
