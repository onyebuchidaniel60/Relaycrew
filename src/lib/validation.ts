export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function validateDeliverableUri(value: string): string | null {
  const uri = value.trim()
  const length = byteLength(uri)
  if (length < 9 || length > 256) {
    return 'The deliverable URI must be between 9 and 256 bytes.'
  }
  if (!uri.startsWith('https://') && !uri.startsWith('ipfs://')) {
    return 'The deliverable URI must start with https:// or ipfs://.'
  }
  return null
}
