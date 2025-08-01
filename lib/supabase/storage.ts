import { createClient } from "./client"

export async function uploadImage(file: File, bucket: string, path: string) {
  const supabase = createClient()

  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return { path: data.path, url: publicUrl }
}

export async function uploadMultipleImages(files: File[], bucket: string, path: string) {
  const uploads = files.map((file) => uploadImage(file, bucket, path))
  return Promise.all(uploads)
}

export async function deleteImage(bucket: string, path: string) {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}

export async function getImageUrl(bucket: string, path: string) {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
