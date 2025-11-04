export type StreamMessage = {
  type: string
  node?: string
  text?: string
  raw?: string // original unprocessed payload
  done?: boolean
}

export interface BuilderState {
  sessionId: string
  messages: StreamMessage[]
  status: 'idle' | 'initializing' | 'streaming' | 'completed' | 'error'
  error?: string
}
