"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseSupabaseUploadOptions {
  bucket: string
  path?: string
  cacheControl?: number
  upsert?: boolean
}

interface UseSupabaseUploadReturn {
  uploadFile: (file: File, customPath?: string) => Promise<string>
  isUploading: boolean
  progress: number
  error: Error | null
}

export function useSupabaseUpload(options: UseSupabaseUploadOptions): UseSupabaseUploadReturn {
  const { bucket, path = "", cacheControl = 3600, upsert = false } = options
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const uploadFile = useCallback(
    async (file: File, customPath?: string): Promise<string> => {
      setIsUploading(true)
      setProgress(0)
      setError(null)

      try {
        const supabase = createClient()
        const filePath = customPath || `${path}/${Date.now()}-${file.name}`

        // Upload file with progress tracking
        const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: `max-age=${cacheControl}`,
          upsert,
          onUploadProgress: (progress) => {
            setProgress((progress.loaded / progress.total) * 100)
          },
        })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

        return urlData.publicUrl
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
        throw errorObj
      } finally {
        setIsUploading(false)
      }
    },
    [bucket, path, cacheControl, upsert],
  )

  return {
    uploadFile,
    isUploading,
    progress,
    error,
  }
}
