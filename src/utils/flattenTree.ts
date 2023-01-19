import { NavMenuItem } from '~/types/interfaces'
// import { pinyin } from 'pinyin-pro'
// import { convertPY } from './filterPinyin'

// const getSearchKey = (keyword: string) => {
//   const first = pinyin(keyword, {
//     pattern: 'first',
//     toneType: 'none'
//   }).replace(/\s+/g, '')
//   const all = pinyin(keyword, {
//     pattern: 'pinyin',
//     toneType: 'none'
//   }).replace(/\s+/g, '')

//   return [first, all, keyword]
// }

/** 扁平化菜单 */
export default function flattenTree(
  treeData: object[],
  prop: string = 'children'
): NavMenuItem[] {
  // let test = '协同系统藏'
  // console.log(convertPY(test))
  const _flatten = (
    treeData: object[],
    prop: string,
    parents: NavMenuItem[]
  ) => {
    let flatResult: NavMenuItem[] = []
    if (Array.isArray(treeData)) {
      // NOTE: 此处用 cloneDeep 后，若没有删除 children 属性，会导致 vue-devtool vuex 面板崩溃。
      // 因此增加扁平化处理后的属性直接增加在 NavMenuItem 类型内。
      // const cloneTree = cloneDeep(treeData)
      // const cloneTree = [...treeData]
      const cloneTree = treeData
      cloneTree.forEach((node: any) => {
        const childrenData = node[prop]
        const isParent = Array.isArray(childrenData) && childrenData.length > 0

        node.parents = parents
        node.fullIds = [node.id].concat(parents.map((item) => item.id))
        node.isParent = isParent
        node.isLeaf = !isParent
        // node.searchKey = getSearchKey(node.text)
        flatResult.push(node)
        if (isParent) {
          flatResult = [
            ...flatResult,
            ..._flatten(childrenData, prop, [...parents, node])
          ]
        }
      })
    }
    return flatResult
  }
  return _flatten(treeData, prop, [])
}
