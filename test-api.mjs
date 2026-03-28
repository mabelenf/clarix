import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'

// Read API key from .env.local
const env = readFileSync('.env.local', 'utf-8')
const apiKey = env.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim()

if (!apiKey) {
  console.error('No ANTHROPIC_API_KEY found in .env.local')
  process.exit(1)
}

console.log('API key found:', apiKey.slice(0, 20) + '...')
console.log('Making request to claude-haiku-4-5-20251001...\n')

const client = new Anthropic({ apiKey })

try {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    messages: [{ role: 'user', content: 'say hello' }],
  })

  console.log('✓ Success')
  console.log('Response:', response.content[0].text)
  console.log('Stop reason:', response.stop_reason)
  console.log('Usage:', response.usage)
} catch (err) {
  console.error('✗ Error:', err.message)
  if (err.status) console.error('  Status:', err.status)
  if (err.error) console.error('  Details:', JSON.stringify(err.error, null, 2))
}
