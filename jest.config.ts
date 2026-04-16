import nextJest from 'next/jest'
import type { Config } from 'jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!unified|remark-parse|remark-rehype|rehype-slug|rehype-highlight|rehype-stringify|bail|is-plain-obj|trough|vfile|vfile-message|unist-util-|mdast-util-|hast-util-|micromark|micromark-|decode-named-character-reference|character-entities|character-entities-html4|character-entities-legacy|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|zwitch|ccount|escape-string-regexp|stringify-entities|trim-lines|longest-streak|html-void-elements|html-whitespace-sensitive-tagging|github-slugger|devlop|lowlight|parse-entities)',
  ],
}

// next/jest adds its own transformIgnorePatterns (including '/node_modules/')
// which override ours. We wrap the config to remove that default pattern so
// our ESM exception list takes effect.
export default async () => {
  const resolved = await createJestConfig(config)()
  resolved.transformIgnorePatterns = resolved.transformIgnorePatterns?.filter(
    (p) => p !== '/node_modules/'
  )
  return resolved
}
