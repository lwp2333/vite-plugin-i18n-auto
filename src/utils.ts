import fs from 'fs/promises'
import _fs from 'fs'
import path from 'path'
import prettier from 'prettier'

export const hasChineseCharacter = (code?: string) => {
  return code && /[\u{4E00}-\u{9FFF}]/gmu.test(code)
}

let prettierConfg: prettier.Options | null = null

const formatByPrettier = async (text: string): Promise<string> => {
  if (!prettierConfg) {
    prettierConfg = await prettier.resolveConfig('.prettierrc')
  }
  return prettier.format(text, { ...prettierConfg, parser: 'json' })
}

const assignlang = (
  lang: Record<string, any>,
  newlang: Record<string, any>
) => {
  if (typeof lang !== 'object' || typeof newlang !== 'object') {
    return lang
  }
  const res = typeof lang === 'object' ? { ...lang } : lang
  for (const key in newlang) {
    if (Object.prototype.hasOwnProperty.call(lang, key)) {
      res[key] = assignlang(lang[key], newlang[key])
    } else {
      res[key] = newlang[key]
    }
  }
  return res
}

export const writeLang = async (
  id: string,
  keyList: string[],
  langList: string[],
  placeholder: string
) => {
  const langDir = path.resolve(path.dirname(id), 'lang.json')
  const langModulePath = langDir.replace(process.cwd(), '')
  let langJson: Record<string, any> = {}
  const isExit = _fs.existsSync(langDir)
  try {
    if (isExit) {
      const res = await require(langDir)
      langJson = res || {}
    } else {
      console.log(`add ${langModulePath}`)
    }
    // generate new lang object
    const moduleToLangJson = langList.reduce((pre, lang, index) => {
      return {
        ...pre,
        [lang]: keyList.reduce((pre, key) => {
          return {
            ...pre,
            [key]: langJson?.[lang]?.[key] || (index === 0 ? key : placeholder),
          }
        }, {}),
      }
    }, {})
    const newLangJson = assignlang(langJson, moduleToLangJson)

    if (JSON.stringify(langJson) === JSON.stringify(newLangJson)) {
      // skip update
      return true
    }
    const formartText = await formatByPrettier(JSON.stringify(newLangJson))
    await fs.writeFile(langDir, formartText, 'utf-8')
    isExit && console.log(`update  ${langModulePath}`)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
