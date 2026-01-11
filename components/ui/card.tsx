import * as React from "react"

export function Card({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border rounded-lg p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
