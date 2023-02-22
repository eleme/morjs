export function upperFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function randomUuid(): string {
  let s = ''
  for (let i = 0; i < 4; i += 1) {
    s += '0000000'
      .concat(Math.floor(Math.random() * 2821109907456).toString(36))
      .slice(-8)
  }
  return s
}

export function getImage(imageResource): Promise<CanvasImageSource> {
  return new Promise((resolve) => {
    const image: CanvasImageSource = new Image()
    image.src = imageResource
    image.onload = () => {
      resolve(image)
    }
  })
}
