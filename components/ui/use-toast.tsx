"use client"

// Enhanced toast component for notifications
import { createContext, useContext, useState, useEffect } from "react"

type ToastType = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToastContextType = {
  toast: (props: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Simple DOM-based toast implementation
const showDOMToast = (props: ToastType) => {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.position = 'fixed'
    toastContainer.style.bottom = '20px'
    toastContainer.style.right = '20px'
    toastContainer.style.zIndex = '9999'
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toast = document.createElement('div')
  toast.style.backgroundColor = props.variant === 'destructive' ? '#f44336' : '#4caf50'
  toast.style.color = 'white'
  toast.style.padding = '16px'
  toast.style.borderRadius = '4px'
  toast.style.marginTop = '10px'
  toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)'
  toast.style.minWidth = '300px'
  toast.style.opacity = '0'
  toast.style.transition = 'opacity 0.3s ease-in-out'

  // Create title
  if (props.title) {
    const title = document.createElement('div')
    title.style.fontWeight = 'bold'
    title.style.marginBottom = '5px'
    title.textContent = props.title
    toast.appendChild(title)
  }

  // Create description
  if (props.description) {
    const description = document.createElement('div')
    description.textContent = props.description
    toast.appendChild(description)
  }

  // Add to container
  toastContainer.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1'
  }, 10)

  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast)
      }
    }, 300)
  }, props.duration || 3000)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const toast = (props: ToastType) => {
    console.log("Toast:", props)
    showDOMToast(props)
    setToasts((prev) => [...prev, props])
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // If no provider is found, provide a default implementation
    return {
      toast: (props: ToastType) => {
        console.log("Toast (no provider):", props)
        showDOMToast(props)
      }
    }
  }
  return context
}

// Export a simplified toast function for direct import
export const toast = (props: ToastType) => {
  console.log("Toast (direct):", props)
  showDOMToast(props)
}
