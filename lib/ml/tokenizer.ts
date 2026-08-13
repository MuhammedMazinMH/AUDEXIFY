import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Minimal WordPiece tokenizer compatible with DistilBERT vocabularies.
 * Loads a standard `vocab.txt` (one token per line). When the vocab file
 * is absent the NLP service falls back to heuristics and never calls this.
 */

const CLS = '[CLS]'
const SEP = '[SEP]'
const UNK = '[UNK]'
const PAD = '[PAD]'

export class WordPieceTokenizer {
  private vocab = new Map<string, number>()

  constructor(vocabPath: string) {
    const lines = readFileSync(vocabPath, 'utf8').split('\n')
    lines.forEach((line, i) => {
      const token = line.trim()
      if (token) this.vocab.set(token, i)
    })
  }

  static tryLoad(vocabPath: string): WordPieceTokenizer | null {
    const resolved = path.resolve(vocabPath)
    if (!existsSync(resolved)) return null
    try {
      return new WordPieceTokenizer(resolved)
    } catch {
      return null
    }
  }

  private basicTokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/([!-/:-@[-`{-~])/g, ' $1 ')
      .split(/\s+/)
      .filter(Boolean)
  }

  private wordPiece(word: string): string[] {
    if (this.vocab.has(word)) return [word]
    const pieces: string[] = []
    let start = 0
    while (start < word.length) {
      let end = word.length
      let piece: string | null = null
      while (start < end) {
        const candidate = (start > 0 ? '##' : '') + word.slice(start, end)
        if (this.vocab.has(candidate)) {
          piece = candidate
          break
        }
        end -= 1
      }
      if (piece === null) return [UNK]
      pieces.push(piece)
      start = end
    }
    return pieces
  }

  /**
   * Encodes text into fixed-length input_ids and attention_mask arrays
   * matching DistilBERT's expected inputs.
   */
  encode(text: string, maxLength = 128): { inputIds: bigint[]; attentionMask: bigint[] } {
    const tokens: string[] = [CLS]
    for (const word of this.basicTokenize(text)) {
      tokens.push(...this.wordPiece(word))
      if (tokens.length >= maxLength - 1) break
    }
    tokens.length = Math.min(tokens.length, maxLength - 1)
    tokens.push(SEP)

    const unkId = this.vocab.get(UNK) ?? 100
    const padId = this.vocab.get(PAD) ?? 0

    const inputIds = tokens.map((t) => BigInt(this.vocab.get(t) ?? unkId))
    const attentionMask = new Array<bigint>(inputIds.length).fill(BigInt(1))

    while (inputIds.length < maxLength) {
      inputIds.push(BigInt(padId))
      attentionMask.push(BigInt(0))
    }

    return { inputIds, attentionMask }
  }
}
