"use client"

import { useState, useEffect } from "react"

export function useToast() {
  const toast = ({ title, description }: { title: string; description?: string }) => {
    console.log(`[Toast] ${title}: ${description || ""}`)
    // Yeh browser mein ek simple alert notification pop-up karega
    if (typeof window !== "undefined") {
      alert(`${title}\n${description || ""}`)
    }
  }

  return { toast }
}
