import ort from 'onnxruntime-node'
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import path from 'node:path'

const MODEL = process.argv[2] ?? '/vercel/share/v0-project/models/vision/model.onnx'
const DS = process.argv[3] ?? '/tmp/vision-backup/ds'
const SIZE = 224
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]
const LABELS = ['dense_layout', 'low_contrast', 'normal', 'small_text']

async function preprocess(file) {
  const { data } = await sharp(file)
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .resize(SIZE, SIZE, { fit: 'fill' })
    .toColourspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const chw = new Float32Array(3 * SIZE * SIZE)
  const px = SIZE * SIZE
  for (let i = 0; i < px; i++)
    for (let c = 0; c < 3; c++) chw[c * px + i] = (data[i * 3 + c] / 255 - MEAN[c]) / STD[c]
  return chw
}

function softmax(a) {
  const m = Math.max(...a)
  const e = a.map((x) => Math.exp(x - m))
  const s = e.reduce((p, q) => p + q, 0)
  return e.map((x) => x / s)
}

const session = await ort.InferenceSession.create(MODEL)
let total = 0
let correct = 0
const perClass = {}
for (const label of LABELS) {
  perClass[label] = { total: 0, correct: 0 }
  const files = readdirSync(path.join(DS, label)).filter((f) => f.endsWith('.png'))
  for (const f of files) {
    const input = await preprocess(path.join(DS, label, f))
    const feeds = { input: new ort.Tensor('float32', input, [1, 3, SIZE, SIZE]) }
    const r = await session.run(feeds)
    const probs = softmax(Array.from(r.logits.data))
    const pred = probs.indexOf(Math.max(...probs))
    total++
    perClass[label].total++
    if (LABELS[pred] === label) {
      correct++
      perClass[label].correct++
    }
  }
}
console.log('Per-class accuracy:')
for (const l of LABELS) console.log(`  ${l}: ${perClass[l].correct}/${perClass[l].total}`)
console.log(`OVERALL: ${correct}/${total} = ${((100 * correct) / total).toFixed(1)}%`)
