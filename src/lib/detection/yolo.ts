import * as ort from 'onnxruntime-web'
import { cardFromClassId } from '../../model/card-yolo-to-glaure';

let session : ort.InferenceSession  | null = null


async function getSession() {
  if (!session) {
    session = await ort.InferenceSession.create('best.onnx')
  }
  return session
}
// Prend un HTMLImageElement ou un HTMLCanvasElement, retourne des Prediction[]

export default async function detectCards(img: HTMLImageElement): Promise<Array<{ classId: number; confidence: number; cx: number; cy: number; w: number; h: number }>> {
  const session = await getSession()
  //console.log('Entrées :', session.inputNames)   // → ['images'] ou autre
  //console.log('Sorties :', session.outputNames)  // → ['output0'] ou autre

  // 1. Redimensionner en 640×640 (taille attendue par YOLO)
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 640
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, 640, 640)

  // 2. Convertir les pixels en tenseur Float32 [0,1] — format NCHW
  const { data } = ctx.getImageData(0, 0, 640, 640)
  const tensor = new Float32Array(3 * 640 * 640)
  for (let i = 0; i < 640 * 640; i++) {
    tensor[i]               = data[i * 4]     / 255  // R
    tensor[i + 640 * 640]   = data[i * 4 + 1] / 255  // G
    tensor[i + 2 * 640 * 640] = data[i * 4 + 2] / 255  // B
  }

  // 3. Inférence
  const input = new ort.Tensor('float32', tensor, [1, 3, 640, 640])


  try {
  const result = await session.run({ images: input })
  const output = result.output0.data as Float32Array
  //console.log('Shape output0 :', result.output0.dims)
  //console.log('5 premières valeurs :', output.slice(0, 5))
  const processedOutput = processOutput(output)
  //console.log('Prédictions :', processedOutput)
  return processedOutput
  } catch (e) {
  console.error('Erreur inférence :', e)
  return []
  }

  
}



function processOutput(output: Float32Array) {
  const NUM_CLASSES = 267
  const NUM_BOXES   = 8400
  const CONF_THRESHOLD = 0.5
  const IOU_THRESHOLD  = 0.7

  const boxes = []

  for (let i = 0; i < NUM_BOXES; i++) {
    // Coordonnées — feature d'abord, boîte ensuite
    const cx = output[0 * NUM_BOXES + i]
    const cy = output[1 * NUM_BOXES + i]
    const w  = output[2 * NUM_BOXES + i]
    const h  = output[3 * NUM_BOXES + i]

    // Trouver la classe avec le score max
    let maxScore = 0, classId = 0
    for (let c = 0; c < NUM_CLASSES; c++) {
    const score = output[(4 + c) * NUM_BOXES + i]
    if (score > maxScore) { maxScore = score; classId = c }
    }

    if (maxScore < CONF_THRESHOLD) continue

    boxes.push({ classId, confidence: maxScore, cx, cy, w, h })
  }

  return nms(boxes, IOU_THRESHOLD).map(box => ({
    ...box,
    card : cardFromClassId(box.classId)
  }))

}

function iou(a: { cx: number; cy: number; w: number; h: number }, b: { cx: number; cy: number; w: number; h: number }): number {
    const x1 = Math.max(a.cx - a.w/2, b.cx - b.w/2)
    const y1 = Math.max(a.cy - a.h/2, b.cy - b.h/2)
    const x2 = Math.min(a.cx + a.w/2, b.cx + b.w/2)
    const y2 = Math.min(a.cy + a.h/2, b.cy + b.h/2)
    const inter = Math.max(0, x2-x1) * Math.max(0, y2-y1)
    const union = a.w*a.h + b.w*b.h - inter

    return inter / union
}

function nms(boxes: Array<{ classId: number; confidence: number; cx: number; cy: number; w: number; h: number }>, threshold: number) {
    const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence)
    const kept: Array<{ classId: number; confidence: number; cx: number; cy: number; w: number; h: number }> = []

    for (const box of sorted) {
      if (kept.every(k => iou(k, box) < threshold)) kept.push(box)
    }

    return kept
}