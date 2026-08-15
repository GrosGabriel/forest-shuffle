import * as ort from 'onnxruntime-web'
import { cardFromClassId } from '../../model/card-yolo-to-glaure';
import { useModelState } from '$lib/states/modelState.svelte.js'

let session : ort.InferenceSession  | null = null
// Une seule promesse de chargement partagée par tous les appelants : si deux
// appels arrivent pendant le chargement (ex. warm-up au montage + clic sur
// Valider juste après), ils attendent la même promesse au lieu de tourner
// indéfiniment en cas d'échec (ancien comportement avec un simple flag booléen).
let sessionPromise : Promise<ort.InferenceSession> | null = null



// iOS/iPadOS a une implémentation WebGPU encore expérimentale dans Safari : plutôt que de lever
// une erreur JS propre, l'inférence peut planter le contexte GPU (donc rien à rattraper avec un
// simple try/catch). On évite le problème en n'essayant jamais webgpu sur ces appareils.
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ se déclare "Macintosh" dans l'UA, on le distingue via le support tactile
  const isIPadOS = ua.includes('Macintosh') && navigator.maxTouchPoints > 1
  return isAppleMobile || isIPadOS
}

function getExecutionProviders(): ort.InferenceSession.ExecutionProviderConfig[] {
  return isIOS() ? ['webgl', 'wasm'] : ['webgpu', 'webgl', 'wasm']
}

// Crée la session ET fait le warmup en un seul essai : un backend "créé" avec succès peut quand
// même planter à la première exécution réelle (c'est le cas vécu avec webgpu sur iOS), donc on ne
// considère un backend comme valide qu'une fois le warmup passé.
async function createAndWarmup(modelUrl: string, providers: ort.InferenceSession.ExecutionProviderConfig[]) {
  const candidate = await ort.InferenceSession.create(modelUrl, { executionProviders: providers })
  await warmup(candidate)
  return candidate
}

async function loadSession(): Promise<ort.InferenceSession> {
  const modelState = useModelState()
  modelState.status = 'loading'
  modelState.error = null

  // BASE_URL n'a pas un format garanti constant (ex: peut valoir le marqueur relatif "./" en
  // build statique au lieu de "/forest-shuffle") : on retire un éventuel "/" final avant de
  // concaténer, sinon on obtient ".//best.onnx" — que certains hébergeurs tolèrent (normalisent)
  // et d'autres non (404 silencieux). Vérifié : c'est actuellement le cas en prod (GitHub Pages
  // normalise, mais on ne veut pas en dépendre).
  const modelUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/best.onnx`
  const providers = getExecutionProviders() // ordre de priorité selon la plateforme

  try {
    session = await createAndWarmup(modelUrl, providers)
  } catch (e) {
    // Filet de sécurité si le backend choisi échoue (création ou premier run) :
    // wasm est le backend le plus universel, on retente avec lui seul avant d'abandonner.
    console.error('Échec session avec', providers, e)
    try {
      session = await createAndWarmup(modelUrl, ['wasm'])
    } catch (e2) {
      // Même wasm échoue : on réinitialise l'état pour qu'un prochain appel puisse réessayer
      // (sinon sessionPromise resterait bloquée sur cet échec pour toujours).
      sessionPromise = null
      session = null
      modelState.status = 'error'
      modelState.error = e2 instanceof Error ? e2.message : String(e2)
      throw e2
    }
  }

  modelState.status = 'ready'
  return session
}

export async function getSession() {
  if (session) return session
  if (!sessionPromise) sessionPromise = loadSession()
  return sessionPromise
}

//Le warmup consiste à faire une inférence factice pour "chauffer" le moteur d'inférence, charger les shaders, etc.
//  Cela permet d'obtenir des temps d'inférence plus rapides lors de la première utilisation réelle.
async function warmup(session: ort.InferenceSession) {
  const dummy = new ort.Tensor('float32', new Float32Array(1 * 3 * 640 * 640), [1, 3, 640, 640])
  await session.run({ images: dummy })
}


// Prend un HTMLImageElement ou un HTMLCanvasElement, retourne des Prediction[]
// Prend un string (URL) finalement, charge l'image, puis retourne des Prediction[]

export default async function detectCards(imgSrc: string): Promise<Array<{ classId: number; confidence: number; cx: number; cy: number; w: number; h: number }>> {
  const session = await getSession()
  //console.log('Entrées :', session.inputNames)   // → ['images'] ou autre
  //console.log('Sorties :', session.outputNames)  // → ['output0'] ou autre

  // 0. Charger l'image depuis l'URL
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = imgSrc
  })



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
  const result = await session!.run({ images: input })
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