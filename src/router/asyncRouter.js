import { listToTree } from '@/utils/tools'
import { useLayoutStore } from '@/stores/global'

// 动态路由名称映射表
const modules = import.meta.glob('../views/**/**.vue')
const components = {
  Layout: () => import('@/components/layout/index.vue'),
}
Object.keys(modules).forEach((key) => {
  const nameMatch = key.match(/^\.\.\/views\/(.+)\.vue/)
  if (!nameMatch) return
  // 排除_Components文件夹下的文件
  if (nameMatch[1].includes('components')) return
  // 如果页面以Index命名，则使用父文件夹作为name
  const indexMatch = nameMatch[1].match(/(.*)\/Index$/i)
  let name = indexMatch ? indexMatch[1] : nameMatch[1]
  ;[name] = name.split('/').splice(-1)
  components[name] = modules[key]
})

const asyncRouter = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: components['404'],
    meta: {
      title: 'NotFound',
      icon: '',
      hidden: true,
    },
    redirect: {
      name: '404',
    },
  },
]

const generatorDynamicRouter = (data) => {
  const { setRoutes } = useLayoutStore()
  const routerList = listToTree(data, 0)
  asyncRouter.forEach((v) => routerList.push(v))
  const f = (data, pData) => {
    for (let i = 0, len = data.length; i < len; i++) {
      const v = data[i]
      if (typeof v.component === 'string') v.component = components[v.component]
      if (!v.meta.permission || (pData && v.meta.permission.length === 0)) {
        v.meta.permission = pData && pData.meta && pData.meta.permission ? pData.meta.permission : []
      }
      if (v.children && v.children.length > 0) {
        f(v.children, v)
      }
    }
  }
  f(routerList, null)
  setRoutes(routerList)
}

export { components, generatorDynamicRouter }
