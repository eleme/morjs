export const stylePropertyMap = {
  fillStyle: '#000000',
  strokeStyle: '#000000',
  globalAlpha: 1.0,
  lineWidth: 1,
  lineCap: 'butt', // butt|round|square
  lineJoin: 'miter', // bevel|round|miter
  miterLimit: 10,
  textBaseline: 'alphabetic', // alphabetic|top|hanging|middle|ideographic|bottom
  lineDashOffset: 0,
  textAlign: 'start',
  globalCompositeOperation: 'source-over'
}

export const styleProperties = Object.keys(stylePropertyMap)

export const toolsProperties = [
  'fillRect',
  'clip',
  'fill',
  'rect',
  'fillRect',
  'strokeRect',
  'stroke',
  'scale',
  'rotate',
  'translate',
  'save',
  'restore',
  'clearRect',
  'fillText',
  'moveTo',
  'lineTo',
  'arcTo',
  'arc',
  'transform',
  'setTransform',
  'beginPath',
  'closePath',
  'quadraticCurveTo',
  'bezierCurveTo',
  'setLineDash',
  'strokeText',
  'addColorStop',
  'setShadow'
]
