"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useFormSubmit<T, D = any>(submitFn: (data: D) => Promise<T>, options: UseFormSubmitOptions<T> = {}) {
  const {
    onSuccess,
    onError,
    successMessage = "Operation completed successfully",
    errorMessage = "An error occurred. Please try again.",
  } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = useCallback(
    async (data: D) => {
      setIsSubmitting(true)

      try {
        const result = await submitFn(data)

        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          })
        }

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))

        if (errorMessage) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }

        if (onError) {
          onError(errorObj)
        }

        throw errorObj
      } finally {
        setIsSubmitting(false)
      }
    },
    [submitFn, onSuccess, onError, successMessage, errorMessage, toast],
  )

  return {
    handleSubmit,
    isSubmitting,
  }
}
