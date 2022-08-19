// 此函数内部可不能写中文，不然就循环递归了
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
