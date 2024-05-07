import { AudioParams, InnerAudio } from './Audio'

export default {
  createInnerAudioContext(params: AudioParams) {
    return new InnerAudio(params)
  }
}
