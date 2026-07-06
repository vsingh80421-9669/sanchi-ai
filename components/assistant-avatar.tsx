"use client"

interface AssistantAvatarProps {
  isActive: boolean
  isSpeaking: boolean
}

export function AssistantAvatar({ isActive, isSpeaking }: AssistantAvatarProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      <div
        className={`absolute w-40 h-40 rounded-full border-2 border-primary transition-all duration-300 ${
          isActive || isSpeaking ? "animate-ping opacity-20" : "opacity-0"
        }`}
      />

      {/* Middle ring */}
      <div
        className={`absolute w-32 h-32 rounded-full border-2 border-primary/60 transition-all duration-300 ${
          isActive || isSpeaking ? "animate-pulse" : "opacity-50"
        }`}
      />

      {/* Core circle */}
      <div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary transition-all duration-300 flex items-center justify-center shadow-lg ${
          isActive || isSpeaking ? "shadow-primary/50 scale-110" : "shadow-primary/20"
        }`}
      >
        <div className="text-4xl font-bold text-primary-foreground">S</div>
      </div>
    </div>
  )
}
