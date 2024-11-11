import fs from 'fs'
import path from 'path'

// 递归遍历目录并重命名符合条件的文件（同步）
function traverseAndRename(dir, matchPattern, renameCallback) {
  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const filePath = path.join(dir, file.name)

    if (file.isDirectory()) {
      // 如果是目录，递归调用 traverseAndRename
      traverseAndRename(filePath, matchPattern, renameCallback)
    } else if (file.isFile() && matchPattern.test(file.name)) {
      // 如果是文件且匹配条件，进行重命名
      const newFileName = renameCallback(file.name)
      const newFilePath = path.join(dir, newFileName)

      try {
        fs.renameSync(filePath, newFilePath)
        console.log(`Renamed ${filePath} to ${newFilePath}`)
      } catch (err) {
        console.error(`Error renaming file ${filePath}:`, err)
      }
    }
  }
}

// 递归遍历目录并替换符合内容条件的文本（同步）
function traverseAndReplaceContent(dir, matchPattern, replacementText) {
  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const filePath = path.join(dir, file.name)

    if (file.isDirectory()) {
      // 如果是目录，递归调用 traverseAndReplaceContent
      traverseAndReplaceContent(filePath, matchPattern, replacementText)
    } else if (file.isFile()) {
      try {
        const data = fs.readFileSync(filePath, 'utf-8')

        // 检查内容是否符合匹配条件
        if (matchPattern.test(data)) {
          // 执行替换
          const newData = data.replace(matchPattern, replacementText)

          // 将新的内容写回文件
          fs.writeFileSync(filePath, newData)
          console.log(`Replaced content in ${filePath}`)
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err)
      }
    }
  }
}

// 使用示例
const targetDir = './dist' // 要遍历的文件夹路径
const matchPattern = /_{3}vite-browser-external/g // 匹配模式
const replacementText = 'vite-browser-external' // 要替换成的新文本

// 定义重命名的规则：在文件名前加上 "renamed_"
const renameCallback = (fileName) => {
  console.log('renameCallback', fileName)
  return fileName.replace(matchPattern, replacementText)
}

// 先执行重命名操作，再执行内容替换
traverseAndRename(targetDir, matchPattern, renameCallback)
traverseAndReplaceContent(targetDir, matchPattern, replacementText)

console.log('fix-vite done')
