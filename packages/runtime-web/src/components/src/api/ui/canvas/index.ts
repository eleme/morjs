import CanvasCtx from './canvas-context'

export default {
  createCanvasContext(id: string) {
    const canvasContext = new CanvasCtx(id)

    return canvasContext
  }
}
