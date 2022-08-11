import fs from 'fs/promises'
import _fs from 'fs'
import path from 'path'
import prettier from 'prettier'
import { merge, isEqual } from 'lodash-es'

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

export const writeLang = async (
  id: string,
  keyList: string[],
  langList: string[],
  placeholder: string
) => {
  const langDir = path.resolve(path.dirname(id), 'lang.json')
  const langModulePath = langDir.replace(process.cwd(), '')
  let sourceJson: Record<string, any> = {}
  const isExit = _fs.existsSync(langDir)
  try {
    if (isExit) {
      const res = await require(langDir)
      sourceJson = res || {}
    } else {
      console.log(`add ${langModulePath}`)
    }
    // generate a new lang object by current module file
    const moduleToLangJson = langList.reduce((pre, lang, index) => {
      return {
        ...pre,
        [lang]: keyList.reduce((pre, key) => {
          return {
            ...pre,
            [key]: index === 0 ? key : placeholder,
          }
        }, {}),
      }
    }, {})
    const newLangJson = merge(moduleToLangJson, sourceJson)
    if (isEqual(sourceJson, newLangJson)) {
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
