"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { z } from "zod"
import { handleError, ErrorType } from "@/lib/error-handler"

interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: z.ZodType<T>
  onSubmit: (values: T) => Promise<void> | void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseFormResult<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  setFieldValue: (field: keyof T, value: any) => void
  setFieldTouched: (field: keyof T, isTouched: boolean) => void
  resetForm: () => void
}

/**
 * Hook for form handling with validation and error handling
 * @param options - Form options
 * @returns Form handling result
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>): UseFormResult<T> {
  const { initialValues, validationSchema, onSubmit, onSuccess, onError } = options

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isDirty, setIsDirty] = useState<boolean>(false)

  // Validate form values
  const validateForm = useCallback(() => {
    if (!validationSchema) return true

    try {
      validationSchema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}

        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path.join(".")
            newErrors[field] = err.message
          }
        })

        setErrors(newErrors)
      }
      return false
    }
  }, [values, validationSchema])

  // Handle form field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target

      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }))

      setIsDirty(true)
    },
    [],
  )

  // Handle form field blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      validateForm()
    },
    [validateForm],
  )

  // Set field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))

    setIsDirty(true)
  }, [])

  // Set field touched
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }))
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setIsDirty(false)
  }, [initialValues])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate form
      const isValid = validateForm()

      if (!isValid) {
        // Mark all fields as touched to show errors
        const allTouched: Record<string, boolean> = {}
        Object.keys(values).forEach((key) => {
          allTouched[key] = true
        })
        setTouched(allTouched)
        return
      }

      setIsSubmitting(true)

      try {
        await onSubmit(values)

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))

        // Handle error
        handleError(errorObj, ErrorType.CLIENT, { component: "useForm", action: "handleSubmit" })

        if (onError) {
          onError(errorObj)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateForm, onSubmit, onSuccess, onError],
  )

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
  }
}
