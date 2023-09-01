import fs from 'fs/promises'
import _fs from 'fs'
import path from 'path'
import prettier from 'prettier'
import type { ChalkInstance } from 'chalk'
class Log {
  private prefix: string = ''
  private Chalk!: ChalkInstance
  constructor(prefix: string) {
    this.prefix = prefix
    this.initChalk()
  }
  private async initChalk() {
    this.Chalk = await import('chalk').then(res => res.default)
  }
  primary(text: string) {
    console.log(this.Chalk.cyanBright(`${this.prefix}${text}`))
  }
  info(text: string) {
    console.log(this.Chalk.greenBright(`${this.prefix}${text}`))
  }
  warning(text: string) {
    console.log(this.Chalk.yellowBright(`${this.prefix}${text}`))
  }
  error(text: string) {
    console.log(this.Chalk.redBright(`${this.prefix}${text}`))
  }
}

const log = new Log('vite-plugin-i18n-auto:')

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
  if (isExit) {
    const res = await fs.readFile(langDir, { encoding: 'utf-8' })
    try {
      sourceJson = JSON.parse(res) || {}
    } catch (error) {
      // parse sourceJson failed directly return true
      return true
    }
  }
  // generate a new lang object by current module file
  const moduleToLangJson = langList.reduce((pre, lang, index) => {
    return {
      ...pre,
      [lang]: keyList.reduce((pre, key) => {
        return {
          ...pre,
          [key]: index === 0 ? key : sourceJson?.[lang]?.[key] || placeholder,
        }
      }, {}),
    }
  }, {})

  try {
    const formartText = await formatByPrettier(JSON.stringify(moduleToLangJson))
    await fs.writeFile(langDir, formartText, 'utf-8')
    isExit
      ? log.info(`update ${langModulePath} success`)
      : log.primary(`add ${langModulePath} success`)

    return true
  } catch (error) {
    log.error(`${langModulePath} ${error as string}`)
    return false
  }
}
