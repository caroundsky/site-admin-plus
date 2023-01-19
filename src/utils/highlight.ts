/**
 * 检索文本高亮
 */
export default function highlight(
  value: any,
  keyword: string[],
  outPutType = 'string',
  options = { tag: 'span', className: 'hightlight' }
) {
  let ifReplace = false
  keyword.forEach((txt) => {
    // const _keyword = txt.trim()
    const keywordReg = new RegExp(txt, 'gi')
    if (!ifReplace) {
      ifReplace = keywordReg.test(value)
    }
    value = value.replace(
      keywordReg,
      (matchedText: string) => `#${matchedText}#`
    )
  })
  const { tag, className } = options
  value = value.replace(
    new RegExp('#.*?#', 'gi'),
    (matchedText: string) =>
      `<${tag} class="${className}">${matchedText.replace(/#/g, '')}</${tag}>`
  )

  if (outPutType === 'object') {
    return {
      ifReplace,
      replaceHtml: value
    }
  } else {
    return value
  }
}
