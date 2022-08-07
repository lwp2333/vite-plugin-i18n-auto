## Install (pnpm or yarn)

**node version:** >=12.0.0

**vite version:** >=2.9.0

```
pnpm i vite-plugin-i18n-auto --save-dev

// or
yarn add vite-plugin-i18n-auto -D

```

## Usage

- Configuration plugin in vite.config.ts

```ts
interface Options {
  /**
   * @note plugin enable ？
   */
  enable: boolean
  /**
   * @note glob pattern
   */
  include: string[]
  /**
   * @note glob pattern
   */
  exclude?: string[]
  /**
   * @default ["zh_cn","en"]
   * @note The default value in the first language will be replaced by the key
   */
  langList?: string[]
  /**
   * @default "To be translated"
   */
  placeholder?: string
  /**
   * @default "!i18n:"
   */
  ignoreMark?: string
}
```

```ts
import vitePluginI18n from 'vite-plugin-i18n-auto'

export default () => {
  return {
    plugins: [
      vitePluginI18n({
        enable: true,
        include: ['/src/**/.{vue,tsx,ts}'],
        langList: ['zh_cn', 'en'],
      }),
    ],
  }
}
```

- add i18nCustomT tranform function to /src/i18n/index.ts

```ts
// 此函数内部可不能写中文，不然就递归循环了
export const i18nCustomT = (
  key: string,
  lang: Record<string, any>,
  injectData?: Array<string | number>
) => {
  const langkey = window.localStorage.getItem('language') || 'zh_cn'
  const langValue = lang?.[langkey]?.[key] as string
  if (!injectData) return langValue
  const [$0, $1, $2, $3, $4, $5, $6, $7, $8, $9] = injectData
  const obj: Record<string, any> = {
    $0,
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
  }
  const tempInjectValue = langValue.replace(/\{[^}]+\}/g, key => {
    const varKey = key.replace('{', '').replace('}', '')
    return obj[varKey] || key
  })
  return tempInjectValue
}
```

## yarn dev

