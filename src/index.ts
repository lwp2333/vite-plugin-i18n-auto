import { Plugin } from 'vite'
import Generator from '@babel/generator'
import Parser from '@babel/parser'
import Traverse from '@babel/traverse'
import Types from '@babel/types'
import Acorn from 'acorn'
import Minimatch from 'minimatch'
import { hasChineseCharacter, writeLang } from './utils'

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

const vitePluginI18n = (option: Options): Plugin | undefined => {
  const {
    enable,
    include = [],
    exclude = [],
    langList = ['zh_cn', 'en'],
    placeholder = 'To be translated',
    ignoreMark = '!i18n:',
  } = option
  if (!enable) return undefined
  return {
    name: 'vite-plugin-i18n-auto',
    async transform(code: string, id: string) {
      const dirId = id.replace(process.cwd(), '')
      const isExcludeFile = exclude.some(it => Minimatch(dirId, it))
      const isIncludeFile = include.some(it => Minimatch(dirId, it))
      const willWirteKeyList: string[] = []
      if (isExcludeFile || !isIncludeFile) {
        return
      }
      const ast = Parser.parse(code, {
        sourceType: 'unambiguous',
        allowImportExportEverywhere: true,
      })
      Traverse(ast, {
        enter(path) {
          // used by console
          const usedByConsole =
            path.parent.type === 'CallExpression' &&
            path.parent.callee.type === 'MemberExpression' &&
            path.parent.callee.object.type === 'Identifier' &&
            path.parent.callee.object.name === 'console'
          // used by comment
          const usedByComment =
            path.parent.type === 'CallExpression' &&
            path.parent.callee.type === 'Identifier' &&
            path.parent.callee.name === '_createCommentVNode'
          if (
            Types.isStringLiteral(path.node) &&
            hasChineseCharacter(path.node.value) &&
            !usedByConsole &&
            !usedByComment
          ) {
            // has ignoreMark: clear mark & ignore
            if (path.node.value.startsWith(ignoreMark)) {
              path.node.value = path.node.value.replace(ignoreMark, '')
              return
            }
            // push key
            willWirteKeyList.push(path.node.value)
            const isTranformed =
              path.parent.type === 'CallExpression' &&
              path.parent.callee.type === 'Identifier' &&
              (path.parent.callee.name === 'i18nCustomT' ||
                path.parent.callee.name === '_i18nCustomT')

            if (isTranformed) return
            // tranform to funtion call
            const _i18nCustomTFun = Types.callExpression(
              Types.identifier('_i18nCustomT'),
              [path.node, Types.identifier('_lang')]
            )
            path.replaceWith(_i18nCustomTFun)
          }
          if (Types.isTemplateLiteral(path.node)) {
            // has chineseCharacter
            const hasCn = path.node.quasis.some(it => {
              return hasChineseCharacter(it.value.cooked)
            })
            if (usedByConsole || !hasCn) {
              return
            }
            // sort quasis、expressions by start position
            const nodeList = [
              ...path.node.quasis,
              ...path.node.expressions,
            ].sort((a, b) => a.start! - b.start!)
            // generate key
            let num = 0
            const cnKey = nodeList.reduce((pre, cur) => {
              if (cur.type === 'TemplateElement') {
                // quasis
                return pre + cur.value.cooked || ''
              } else {
                // expressions
                return pre + `{$${num++}}`
              }
            }, '')
            // push key
            willWirteKeyList.push(cnKey)
            // tranform to funtion call and injectValue
            const _i18nCustomTFun = Types.callExpression(
              Types.identifier('_i18nCustomT'),
              [
                Types.stringLiteral(cnKey),
                Types.identifier('_lang'),
                Types.arrayExpression(path.node.expressions as any),
              ]
            )
            path.replaceWith(_i18nCustomTFun)
          }
        },
      })
      if (willWirteKeyList.length) {
        // write lang.json
        const success = await writeLang(
          id,
          willWirteKeyList,
          langList,
          placeholder
        )
        // import _lang _i18nCustomT
        const importCustomT = Types.importDeclaration(
          [
            Types.importSpecifier(
              Types.identifier('_i18nCustomT'),
              Types.identifier('i18nCustomT')
            ),
          ],
          Types.stringLiteral('@/i18n')
        )
        const importLang = Types.importDeclaration(
          [Types.importDefaultSpecifier(Types.identifier('_lang'))],
          Types.stringLiteral('./lang.json')
        )

        success && ast.program.body.unshift(importLang, importCustomT)
      }
      const resultCode = Generator(ast)

      return {
        ...resultCode,
        ast: Acorn.parse(resultCode.code, {
          sourceType: 'module',
          ecmaVersion: 'latest',
        }),
      }
    },
    handleHotUpdate({ file, server }) {
      if (Minimatch(file, '/**/lang.json')) {
        server.ws.send({
          type: 'full-reload',
          path: file,
        })
      }
    },
  }
}

export default vitePluginI18n

