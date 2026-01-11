import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost"
  size?: "default" | "sm"
}

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const variantClasses =
    variant === "ghost"
      ? "bg-transparent hover:bg-secondary"
      : "bg-primary text-primary-foreground hover:bg-primary/90"

  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : "h-10 px-4"

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md transition ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    />
  )
}
