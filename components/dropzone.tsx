"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useSupabaseUpload } from "@/hooks/use-supabase-upload"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

interface DropzoneProps {
  bucket: string
  path: string
  acceptedFileTypes?: string[]
  maxSize?: number
  onUploadComplete: (url: string, file: File) => void
  className?: string
}

export function Dropzone({
  bucket,
  path,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  maxSize = 5 * 1024 * 1024, // 5MB
  onUploadComplete,
  className = "",
}: DropzoneProps) {
  const [error, setError] = useState<string | null>(null)
  const { uploadFile, isUploading, progress } = useSupabaseUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)

      if (acceptedFiles.length === 0) {
        return
      }

      const file = acceptedFiles[0]

      try {
        const url = await uploadFile(file, bucket, `${path}/${Date.now()}-${file.name}`)
        onUploadComplete(url, file)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file")
      }
    },
    [bucket, path, uploadFile, onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
  })

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/20"
        } ${isDragReject ? "border-destructive bg-destructive/10" : ""}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="w-full space-y-4">
            <LoadingSpinner size="sm" />
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-center text-muted-foreground">Uploading... {Math.round(progress)}%</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop the file here" : "Drag & drop a file here, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {acceptedFileTypes.join(", ")} (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-4 flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          {...getRootProps()}
          className="text-xs"
        >
          Select File
        </Button>
      </div>
    </div>
  )
}
