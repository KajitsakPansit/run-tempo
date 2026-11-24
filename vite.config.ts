import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const env = (Reflect.get(globalThis, 'process')?.env ?? {}) as Record<string, string | undefined>
const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1]
const base = env.GITHUB_ACTIONS === 'true' && repositoryName && !repositoryName.endsWith('.github.io')
  ? `/${repositoryName}/`
  : '/'

export default defineConfig({
  base,
  plugins: [react()],
})
