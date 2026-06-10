/**
 * 递归查找菜单树中的节点
 */
export function findMenuNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findMenuNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * 将菜单树转为扁平选项（用于上级菜单选择器）
 */
export function treeToOptions(tree, prefix = '') {
  const result = []
  tree.forEach(node => {
    result.push({
      value: node.id,
      label: prefix + node.menuName,
      disabled: node.menuType === 3 // 按钮不可作为父级
    })
    if (node.children) {
      result.push(...treeToOptions(node.children, prefix + '├─ '))
    }
  })
  return result
}

/**
 * 去重
 */
export function unique(arr) {
  return [...new Set(arr)]
}
