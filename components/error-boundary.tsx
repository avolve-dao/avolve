"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { handleError, ErrorType } from "@/lib/error-handler"
import { ErrorBoundaryFallback } from "@/components/error-states/error-boundary-fallback"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnChange?: any[]
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Handle error
    handleError(error, ErrorType.CLIENT, {
      component: "ErrorBoundary",
      additionalData: { errorInfo },
    })

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public componentDidUpdate(prevProps: Props) {
    // Reset error state if resetOnChange props have changed
    if (
      this.state.hasError &&
      this.props.resetOnChange &&
      prevProps.resetOnChange &&
      this.props.resetOnChange.some((value, index) => value !== prevProps.resetOnChange?.[index])
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      })
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    const { error, errorInfo } = this.state
    const { fallback, children } = this.props

    if (error) {
      if (fallback) {
        return fallback({ error, resetErrorBoundary: this.resetErrorBoundary })
      }

      return (
        <ErrorBoundaryFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          componentStack={errorInfo?.componentStack}
        />
      )
    }

    return children
  }
}

export default ErrorBoundary
