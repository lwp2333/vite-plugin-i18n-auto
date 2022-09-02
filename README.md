![vite-plugin-i18n-auto](https://cdn200.oss-cn-hangzhou.aliyuncs.com/md/vite-plugin-i18n-auto.png)



## Install

**node version:** >=12.0.0

**vite version:** >=3.0.4

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
   * @default false
   * @note ast replace your code to call i18nCustomT(key,lang,[...injectData])
   */
  autoASTRepalce?: boolean
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
        autoASTRepalce: true,
        include: ['/src/**/*.{vue,tsx,ts}'],
        exclude: [],
        langList: ['zh_cn', 'en'],
      }),
    ],
    resolve: {
      alias: {
        '@': '/src/', // 这是必须的 i18nCustomT 函数自动导入路径为 @/i18n
      },
    },
  }
}
```

- add i18nCustomT tranform function to /src/i18n/index.ts

```ts
// 此函数内部不能写中文，不然就循环递归了(除非你已经忽略该文件)
export const i18nCustomT = (
  key: string,
  lang: Record<string, any>,
  injectData?: Array<string | number>
) => {
  const langkey = window.localStorage.getItem('language') || 'zh_cn'
  const text = lang?.[langkey]?.[key] as string
  if (!injectData) return text

  const injectDataMap: Record<string, string | number> = injectData.reduce(
    (pre, cur, index) => {
      return {
        ...pre,
        [`$${index}`]: cur,
      }
    },
    {}
  )
  const injectValueText = text.replace(/\{[^}]+\}/g, key => {
    const varKey = key.replace('{', '').replace('}', '')
    return (injectDataMap[varKey] as string) || key
  })
  return injectValueText
}
```

## yarn dev

