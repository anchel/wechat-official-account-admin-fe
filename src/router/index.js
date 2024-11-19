import { createRouter, createWebHistory } from 'vue-router'

import { components } from '@/router/asyncRouter'

const Components = Object.assign({}, components, {
  Layout: () => import('@/components/layout/index.vue'),
  LayoutSystem: () => import('@/components/layout/layout-system.vue'),
  Redirect: () => import('@/components/layout/redirect.vue'),
  LayoutBlank: () => import('@/components/layout/blank.vue'),
})

// 静态路由页面
export const allowRouter = [
  {
    name: 'HomeRoot',
    path: '/',
    component: Components['Layout'],
    redirect: '/home',
    meta: { title: '首页', icon: 'el-icon-eleme' },
    children: [
      {
        name: 'Home',
        path: '/home',
        component: Components['workplace'],
        meta: { title: '首页', icon: 'el-icon-house' },
      },
    ],
  },
  {
    name: 'AutoReplyRoot',
    path: '/autoreply',
    component: Components['Layout'],
    redirect: '/autoreply/home',
    meta: { title: '自动回复', icon: 'el-icon-chat-square' },
    children: [
      {
        name: 'AutoReply',
        path: '/autoreply/home',
        component: Components['auto-reply'],
        meta: { title: '自动回复', icon: 'el-icon-chat-square' },
      },
    ],
  },
  {
    name: 'MenuRoot',
    path: '/menu',
    component: Components['Layout'],
    redirect: '/menu/normal',
    meta: { title: '自定义菜单', icon: 'el-icon-menu' },
    children: [
      {
        name: 'MenuNormal',
        path: '/menu/normal',
        component: Components['MenuNormal'],
        meta: { title: '通用菜单', icon: 'el-icon-grid' },
      },
      {
        name: 'MenuConditional',
        path: '/menu/conditional',
        component: Components['MenuConditional'],
        meta: { title: '个性化菜单', icon: 'el-icon-discount' },
      },
    ],
  },
  {
    name: 'MaterialRoot',
    path: '/material',
    component: Components['Layout'],
    redirect: '/material/list',
    meta: { title: '素材管理', icon: 'el-icon-film' },
    children: [
      {
        name: 'Material',
        path: '/material/list',
        component: Components['MaterialPerm'],
        meta: { title: '永久素材', icon: 'el-icon-document-copy' },
      },
      {
        name: 'MaterialTmp',
        path: '/material/list-temp',
        component: Components['MaterialTemp'],
        meta: { title: '临时素材', icon: 'el-icon-document-remove' },
      },
    ],
  },
  {
    name: 'QrcodeRoot',
    path: '/qrcode',
    component: Components['Layout'],
    redirect: '/qrcode/list',
    meta: { title: '渠道二维码', icon: 'el-icon-postcard' },
    children: [
      {
        name: 'QrcodePerm',
        path: '/qrcode/list',
        component: Components['QrcodePerm'],
        meta: { title: '永久二维码', icon: 'el-icon-document-copy' },
      },
      {
        name: 'QrcodeTemp',
        path: '/qrcode/list-temp',
        component: Components['QrcodeTemp'],
        meta: { title: '临时二维码', icon: 'el-icon-document-remove' },
      },
    ],
  },
  {
    name: 'UserMgrRoot',
    path: '/user',
    component: Components['Layout'],
    redirect: '/user/tag-list',
    meta: { title: '用户管理', icon: 'el-icon-user' },
    children: [
      {
        name: 'UserTagList',
        path: '/user/tag-list',
        component: Components['TagList'],
        meta: { title: '标签管理', icon: 'el-icon-collection-tag' },
      },
      {
        name: 'UserList',
        path: '/user/user-list',
        component: Components['UserList'],
        meta: { title: '用户列表', icon: 'el-icon-user' },
      },
    ],
  },
  {
    name: 'RequestLogRoot',
    path: '/request-log',
    component: Components['Layout'],
    redirect: '/request-log/list',
    meta: { title: '操作日志', icon: 'el-icon-document' },
    children: [
      {
        name: 'RequestLog',
        path: '/request-log/list',
        component: Components['RequestLog'],
        meta: { title: '操作日志', icon: 'el-icon-document' },
      },
    ],
  },
  {
    name: 'ErrorPage',
    path: '/error',
    meta: { title: '错误页面', icon: 'el-icon-eleme', hidden: true },
    component: Components.Layout,
    redirect: '/error/404',
    children: [
      {
        name: '401',
        path: '/error/401',
        component: Components['401'],
        meta: { title: '401', icon: 'el-icon-tools' },
      },
      {
        name: '404',
        path: '/error/404',
        component: Components['404'],
        meta: { title: '404', icon: 'el-icon-tools' },
      },
    ],
  },
  {
    name: 'SystemRoot',
    path: '/system',
    component: Components['LayoutSystem'],
    meta: { title: '系统设置', icon: 'el-icon-setting', hidden: true },
    redirect: '/system/user/list',
    children: [
      {
        name: 'SystemUserList',
        path: '/system/user/list',
        component: Components['SystemUserList'],
        meta: { title: '用户管理', icon: 'el-icon-user' },
      },
      {
        name: 'SystemAppidList',
        path: '/system/appid/list',
        component: Components['AppidList'],
        meta: { title: '公众号管理', icon: 'el-icon-list' },
      },
    ],
  },
  {
    name: 'Login',
    path: '/login',
    component: Components['Login'],
    meta: { title: '登录', icon: 'el-icon-eleme', hidden: true },
  },
  {
    name: 'ChangePassword',
    path: '/change-password',
    component: Components['ChangePassword'],
    meta: { title: '修改密码', icon: 'el-icon-eleme', hidden: true },
  },
  {
    name: 'SelectAppid',
    path: '/appid/select',
    component: Components['SelectAppid'],
    meta: { title: '选择公众号', icon: 'el-icon-eleme', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(), // createWebHistory
  routes: allowRouter,
})

export default router
