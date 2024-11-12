import qs from 'qs'
import ajax from './request.js'
import { ElMessage } from 'element-plus'

/**
 * 获取localStorage对象并转成对应的类型
 * @param name localStorage设置名称
 */
export function getLocal(name) {
  const l = localStorage.getItem(name)
  return JSON.parse(l !== null ? l : '{}')
}

/**
 * 函数节流
 * @param time 间隔时间
 */
export function throttle(time = 500) {
  let timer = null
  let firstTime = true
  return () => {
    return new Promise((resolve) => {
      if (firstTime) {
        resolve()
        return (firstTime = false)
      }
      if (timer) return false
      timer = setTimeout(() => {
        if (timer) clearTimeout(timer)
        timer = null
        resolve()
      }, time)
    })
  }
}

/**
 * list结构转tree
 * @param data list原始数据
 * @param pid 最外层pid
 * @param isChildNull 是否过滤没有子节点的数据
 */
export function listToTree(data, pid = 1, isChildNull = false) {
  const d = []
  data.forEach((val) => {
    if (val.parentId === pid) {
      const list = listToTree(data, val.id, isChildNull)
      const obj = { ...val }
      if (!isChildNull || list.length !== 0) {
        obj.children = list
      }
      d.push(obj)
    }
  })
  return d
}

export function getKeyGenerator(prefix, start, keySet) {
  return function () {
    let key
    for (;;) {
      start += 1
      key = `${prefix}${start}`
      if (!keySet.has(key)) {
        keySet.add(key)
        break
      }
    }
    return key
  }
}

export function getMaterialUrl(mediaType, mediaId, mediaCat) {
  // console.log(`/api/material/source-local?` + qs.stringify({ media_type: mediaType, media_id: mediaId }))
  return `/api/material/source-local?` + qs.stringify({ media_type: mediaType, media_id: mediaId, media_cat: mediaCat })
}

export function formatDateTime(prefix, t) {
  if (!t) {
    return ''
  }
  const date = new Date(t)
  return `${prefix}${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}:${date.getMinutes()}`
}

export async function uploadImage(file, fileName) {
  console.log('uploadImage', file, fileName)

  const formData = new FormData()
  formData.append('file', file, fileName)

  let response = await ajax.post('/api/system/image/upload', formData)

  let data = response.data
  if (data.code !== 0) {
    return ''
  }

  return data.data.imgUrl
}

export function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => {
      ElMessage.success('复制成功')
    },
    (err) => {
      ElMessage.error('复制失败' + err)
    },
  )
}
