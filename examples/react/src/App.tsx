import './App.css'

const App = () => {
  // 1. 普通字符串值
  const text = '普通字符串'
  // 2. 作为条件判断
  if (text === '普通字符串') {
    console.log('===', text)
  }
  // 3. 函数参数
  const tempFun = (text: string) => text + '混搭'
  const funcall = tempFun('哈哈哈哈')
  console.log('funcall', funcall)

  const timeInfo = {
    year: 2022,
    month: 8,
    day: 8,
  }
  const textMap: string[] = [
    // 4.1  模版字符串
    `模版字符串`,
    // 4.2 模版字符串 含中文字符，或者其它全是变量且无其它复杂逻辑（函数、运算符什么的）
    `今天是${timeInfo.year}年${timeInfo.month}月${timeInfo.day}日`,
    // 4.3 模版字符串中有函数
    `${tempFun('模版中函数的参数')}, 你仍是我的光芒`,
  ]

  console.log(textMap)
  // 5.忽略转换标记[!i18n]
  const cnMap = {
    一年级: '!i18n:一年级/Grade one',
  }
  console.log('我是', cnMap)

  const hanldeClick = () => {
    cnMap.一年级 = '无产者'
  }
  return (
    <div className="App">
      {textMap.map((it, index) => {
        return <span key={index}>{it}</span>
      })}
      <div title="标题" onClick={hanldeClick}>
        立即进入
        {'立即进入'}
      </div>
    </div>
  )
}

export default App

