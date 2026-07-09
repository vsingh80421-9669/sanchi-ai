export type RecognitionMode = "sleep" | "active" | "locked"

export class SpeechRecognitionService {
  private recognition: any
  private isSupported: boolean
  private mode: RecognitionMode = "sleep"
  private isRecognitionRunning = false
  private restartTimeout: any = null
  private shouldBePaused = false
  private lastOutput = ""
  private lastOutputTime = 0
  private silenceLock = false

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.isSupported = !!SpeechRecognition

      if (this.isSupported) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = false
        this.recognition.lang = "hi-IN"
      }
    } else {
      this.isSupported = false
    }
  }

  isAvailable(): boolean {
    return this.isSupported
  }

  private isValidInput(text: string): boolean {
    if (text.length < 4) return false

    if (this.mode === "sleep" && !text.includes("sanchi") && !text.includes("सांची")) {
      return false
    }

    return true
  }

  startContinuous(
    onWakeWord: () => void,
    onCommand: (transcript: string) => void,
    onStop: () => void,
    onError?: (error: any) => void,
  ): void {
    if (!this.isSupported) {
      onError?.({ message: "Speech recognition not supported" })
      return
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      console.log("[v0] Heard:", transcript)

      if (!this.isValidInput(transcript)) {
        console.log("[v0] Input filtered - too short or invalid")
        return
      }

      if (this.isSimilarToLastOutput(transcript)) {
        console.log("[v0] Ignoring - similar to last output (anti-loop)")
        return
      }

      if (this.silenceLock) {
        if (
          transcript.includes("sanchi start") ||
          transcript.includes("sanchi wapas") ||
          transcript.includes("सांची स्टार्ट") ||
          transcript.includes("सांची वापस")
        ) {
          console.log("[v0] Unlocking silence mode")
          this.silenceLock = false
          this.mode = "active"
          onWakeWord()
        }
        return
      }

      if (this.mode === "sleep") {
        if (transcript.includes("sanchi") || transcript.includes("सांची")) {
          console.log("[v0] Wake word detected - entering active mode")
          this.mode = "active"
          onWakeWord()
        }
        return
      }

      if (this.mode === "active") {
        if (
          transcript.includes("band") ||
          transcript.includes("chup") ||
          transcript.includes("बंद") ||
          transcript.includes("चुप") ||
          transcript.includes("stop listening") ||
          transcript.includes("go silent")
        ) {
          console.log("[v0] Stop command detected - entering locked mode")
          this.mode = "locked"
          this.silenceLock = true
          onStop()
          return
        }

        if (transcript.includes("force stop") || transcript.includes("फोर्स स्टॉप")) {
          console.log("[v0] Force stop - instant silence")
          this.mode = "locked"
          this.silenceLock = true
          return
        }

        onCommand(transcript)
      }
    }

    this.recognition.onerror = (event: any) => {
      console.log("[v0] Speech recognition error:", event.error)
      this.isRecognitionRunning = false

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout)
        this.restartTimeout = null
      }

      if (this.shouldBePaused) {
        return
      }

      if (event.error === "no-speech" || event.error === "audio-capture") {
        this.restartTimeout = setTimeout(() => this.safeStart(), 1000)
      } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.log("[v0] Microphone access denied")
        onError?.(event)
      } else if (event.error !== "aborted") {
        this.restartTimeout = setTimeout(() => this.safeStart(), 500)
      }
    }

    this.recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      this.isRecognitionRunning = false

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout)
        this.restartTimeout = null
      }

      if (this.shouldBePaused) {
        return
      }

      this.restartTimeout = setTimeout(() => this.safeStart(), 300)
    }

    this.recognition.onstart = () => {
      console.log("[v0] Speech recognition started")
      this.isRecognitionRunning = true
    }

    this.safeStart()
  }

  start(onResult: (transcript: string) => void, onError?: (error: any) => void): void {
    if (!this.isSupported) {
      onError?.({ message: "Speech recognition not supported" })
      return
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    this.recognition.onerror = (event: any) => {
      this.isRecognitionRunning = false
      onError?.(event)
    }

    this.recognition.onstart = () => {
      this.isRecognitionRunning = true
    }

    this.recognition.onend = () => {
      this.isRecognitionRunning = false
    }

    this.safeStart()
  }

  stop(): void {
    if (this.isSupported) {
      this.mode = "sleep"
      this.isRecognitionRunning = false

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout)
        this.restartTimeout = null
      }

      try {
        this.recognition.stop()
      } catch (e) {
        console.log("[v0] Recognition already stopped")
      }
    }
  }

  getMode(): RecognitionMode {
    return this.mode
  }

  getSilenceLock(): boolean {
    return this.silenceLock
  }

  pauseForSpeaking(): void {
    if (!this.isSupported || !this.isRecognitionRunning) {
      return
    }

    console.log("[v0] Pausing recognition for speaking")
    this.shouldBePaused = true

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }

    try {
      this.recognition.stop()
    } catch (e) {
      // Already stopped
    }
  }

  resumeAfterSpeaking(): void {
    if (!this.isSupported) {
      return
    }

    console.log("[v0] Resuming recognition after speaking")
    this.shouldBePaused = false

    this.restartTimeout = setTimeout(() => {
      this.safeStart()
    }, 800)
  }

  setLastOutput(text: string): void {
    this.lastOutput = text.toLowerCase()
    this.lastOutputTime = Date.now()
  }

  private isSimilarToLastOutput(text: string): boolean {
    const timeSinceLastOutput = Date.now() - this.lastOutputTime
    if (timeSinceLastOutput > 15000) {
      return false
    }

    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "")
    const cleanLastOutput = this.lastOutput.replace(/[^\w\s]/g, "")

    const sanchiSignatures = [
      "boss",
      "smile",
      "स्माइल",
      "kya aapko",
      "क्या आपको",
      "madad chahiye",
      "मदद चाहिए",
      "aapki commands",
      "आपकी कमांड",
      "theek hai",
      "ठीक है",
      "ji boss",
      "जी बॉस",
    ]

    const hasSanchiSignature = sanchiSignatures.some((sig) => cleanText.includes(sig))

    if (hasSanchiSignature && cleanLastOutput) {
      const words = cleanText.split(" ")
      const lastWords = cleanLastOutput.split(" ")
      const commonWords = words.filter((w) => lastWords.includes(w))
      const similarity = commonWords.length / Math.max(words.length, lastWords.length)

      return similarity > 0.3
    }

    return false
  }

  private safeStart(): void {
    if (!this.isSupported || this.isRecognitionRunning || this.shouldBePaused) {
      return
    }

    try {
      this.recognition.start()
    } catch (e: any) {
      if (e.name === "InvalidStateError") {
        console.log("[v0] Recognition already running")
      }
    }
  }
}
