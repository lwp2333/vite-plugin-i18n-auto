/**
 * @notes 开启autoASTRepalce时， 请确保该函数内部没写中文字符
 * 或者你可以直接配置exclude忽略该文件，不然会递归爆栈
 */
export const i18nCustomT = (key: string, lang: Record<string, any>, injectData?: Array<string | number>) => {
  const langkey = window.localStorage.getItem('language') || 'zh_cn'
  const text = lang?.[langkey]?.[key] as string
  if (!injectData) return text

  const injectDataMap: Record<string, string | number> = injectData.reduce((pre, cur, index) => {
    return {
      ...pre,
      [`$${index}`]: cur,
    }
  }, {})
  const injectValueText = text.replace(/\{[^}]+\}/g, key => {
    const varKey = key.replace('{', '').replace('}', '')
    return (injectDataMap[varKey] as string) || key
  })
  return injectValueText
}
