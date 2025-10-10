import { createClient } from '@supabase/supabase-js'
import path from 'node:path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE! 
const BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET ?? 'products' 

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
})

function getExtFromMime(mime?: string): string {
  if (!mime) return 'png'
  const m = mime.toLowerCase()
  if (m.includes('jpeg')) return 'jpg'
  if (m.includes('png')) return 'png'
  if (m.includes('webp')) return 'webp'
  if (m.includes('gif')) return 'gif'
  if (m.includes('avif')) return 'avif'
  return 'png'
}

export async function uploadProductImage(file: File, opts: {
  folder?: string
  filenameBase?: string // slug o nombre base
}): Promise<{ publicUrl: string; path: string }> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const folder = (opts.folder ?? 'products').replace(/^\/+|\/+$/g, '')
  const ext = (path.parse(file.name ?? '').ext.replace(/^\./, '') || getExtFromMime(file.type)).toLowerCase()
  const safeBase = (opts.filenameBase ?? 'image')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '')
    || 'image'

  const objectPath = `${folder}/${safeBase}-${Date.now()}.${ext}`

  const { error: upErr } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType: file.type || `image/${ext}`, upsert: false })

  if (upErr) throw upErr

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath)
  return { publicUrl: data.publicUrl, path: objectPath }
}
