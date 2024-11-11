<template>
  <div class="wechat-menu-editor" :style="'transform:scale(' + scale + '%,' + scale + '%)'">
    <header>
      <!--header-->
      <div class="status-bar flex flex-justify">
        <div>10:00</div>
        <div class="flex">
          <div class="flex signal"><i></i><i></i><i></i><i></i></div>
          <div>4G</div>
          <div class="battery"></div>
        </div>
      </div>
      <div class="title-bar flex flex-justify">
        <div><i class="icon icon-left"></i></div>
        <div>{{ title }}</div>
        <div><i class="icon icon-user"></i></div>
      </div>
    </header>
    <footer>
      <i class="icon icon-keyboard"></i>
      <div class="menus flex">
        <div
          v-for="menu in localMenus.list"
          v-bind:key="menu.key"
          @click.stop="clickRootMenu(menu)"
          class="menu-item"
          :class="buildRootMenuClass(menu, localMenus.list)"
        >
          <a href="javascript:void(0);" style="user-select: none">{{ menu.name }}</a>
          <div
            v-show="!!menu.selected || (menu.children && menu.children.some((sub) => !!sub.selected))"
            class="menu-children"
          >
            <div class="menu-items">
              <div
                v-for="childMenu in menu.children"
                v-bind:key="childMenu.key"
                @click.stop="clickChildMenu(menu, childMenu)"
                :class="buildChildMenuClass(childMenu, menu)"
                class="menu-item"
              >
                <a href="javascript:void(0);" style="user-select: none">{{ childMenu.name }}</a>
                <div class="del-area-right" v-if="editable && childMenu.type !== 'add'" @click.stop>
                  <el-popconfirm title="确定删除吗?" @confirm="removeChildMenu(menu, childMenu)">
                    <template #reference>
                      <el-icon size="20">
                        <Delete />
                      </el-icon>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
            <div class="triangle-down"></div>
          </div>
          <div v-if="editable && menu.type !== 'add'" class="del-area" @click.stop>
            <el-popconfirm title="确定删除吗?" @confirm="removeRootMenu(menu)">
              <template #reference>
                <el-icon size="20">
                  <Delete />
                </el-icon>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { getKeyGenerator } from '@/utils/tools'
import { onMounted, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

/**
 * 菜单类型
 */
const MENU_TYPE = { ADD: 'add', NORMAL: 'click' }

const { buttons, editable, keyPrefix } = defineProps({
  title: {
    type: String,
    default: '公众号名称',
  },
  buttons: {
    type: Array,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  scale: {
    type: Number,
    default: 100,
  },
})

const selectedMenu = defineModel('selected')
const localMenus = defineModel('menus')

const emit = defineEmits(['remove-menu'])

let keySet = new Set()
let keyGenerator = () => {
  return ''
}

watch(
  () => keyPrefix,
  () => {
    keySet = new Set()
    keyGenerator = getKeyGenerator(keyPrefix, 0, keySet)
  },
)

onMounted(() => {
  console.log('mounted')
  keySet = new Set()
  keyGenerator = getKeyGenerator(keyPrefix, 0, keySet)

  if (!localMenus.value.list) {
    localMenus.value.list = []
  }

  init()
})

watch(
  () => buttons,
  () => {
    console.log('watch buttons change')
    keySet = new Set()
    keyGenerator = getKeyGenerator(keyPrefix, 0, keySet)

    localMenus.value.list = []
    init()
  },
)

const init = () => {
  const list = localMenus.value.list

  buttons.forEach((item) => {
    if (!item.children) {
      item.children = []
    }
    list.push(item)
  })

  collectAllKeys()
  fixItemKey()

  let rootMenuLen = buttons.length
  if (rootMenuLen === 0 && editable) {
    list.push({ type: MENU_TYPE.ADD, name: '+添加菜单', key: 'add' })
  } else if (editable && !buttons.some((m) => m.type === MENU_TYPE.ADD)) {
    list.push({ type: MENU_TYPE.ADD, name: '+添加', key: 'add' })
  }

  for (let i = 0; i < list.length; i++) {
    let rootMenu = list[i]
    if (rootMenu.type === MENU_TYPE.ADD) {
      continue
    }

    if (rootMenu.children && !rootMenu.children.some((sub) => sub.type === MENU_TYPE.ADD)) {
      rootMenu.children.push({ type: MENU_TYPE.ADD, name: '+添加', key: 'add' })
    }

    if (rootMenu.selected) {
      clickRootMenu(rootMenu)
    }

    for (let j = 0, clen = rootMenu.children.length; j < clen; j++) {
      let childMenu = rootMenu.children[j]
      if (childMenu.selected) {
        clickChildMenu(rootMenu, childMenu)
      }
    }
  }
}

const collectAllKeys = () => {
  buttons.forEach((menu) => {
    if (menu.type !== MENU_TYPE.ADD && menu.key) {
      keySet.add(menu.key)
    }
    if (menu.children) {
      menu.children.forEach((child) => {
        if (child.type !== MENU_TYPE.ADD && child.key) {
          keySet.add(child.key)
        }
      })
    }
  })
}

const fixItemKey = () => {
  localMenus.value.list.forEach((menu) => {
    if (menu.type === MENU_TYPE.ADD) {
      menu.key = 'add'
    } else {
      if (!menu.key) {
        menu.key = keyGenerator() // 这里必须要有key，因为vue渲染需要。但是提交的时候，需要选择性的处理，比如view就不需要key
      }
      keySet.add(menu.key)
    }

    if (menu.children) {
      menu.children.forEach((child) => {
        if (child.type === MENU_TYPE.ADD) {
          child.key = 'add'
        } else {
          if (!child.key) {
            child.key = keyGenerator()
          }
          keySet.add(child.key)
        }
      })
    }
  })
}

/**
 * 点击一级菜单
 */
const clickRootMenu = (parentMenu) => {
  let menuList = localMenus.value.list
  removeAllMenuSelected(parentMenu)
  if (parentMenu.type === MENU_TYPE.ADD) {
    let newMenu = buildDefaultRootMenu()
    let menuLen = menuList.length
    menuList.splice(menuLen - 1, 0, newMenu)
    selectedMenu.value = newMenu
  } else {
    parentMenu.selected = true
    selectedMenu.value = parentMenu
  }
}

const removeRootMenu = (parentMenu) => {
  let menuList = localMenus.value.list
  let index = menuList.indexOf(parentMenu)
  menuList.splice(index, 1)
  emit('remove-menu', parentMenu)

  let list = menuList.filter((menu) => menu.type !== 'add')
  if (list.length === 0) {
    selectedMenu.value = null
  } else {
    let minIndex = index - 1
    if (minIndex < 0) {
      minIndex = 0
    }

    menuList[minIndex].selected = true
    selectedMenu.value = menuList[minIndex]
  }
}

/**
 * 点击子菜单
 */
const clickChildMenu = (parentMenu, childMenu) => {
  removeAllMenuSelected(parentMenu, childMenu)
  if (childMenu.type === MENU_TYPE.ADD) {
    let defaultMenu = {
      key: keyGenerator(),
      type: 'click',
      name: '新子菜单',
      selected: true,
    }
    parentMenu.children.splice(parentMenu.children.length - 1, 0, defaultMenu)
    selectedMenu.value = defaultMenu

    parentMenu.type = ''
  } else {
    childMenu.selected = true
    selectedMenu.value = childMenu
  }
}

const removeChildMenu = (parentMenu, childMenu) => {
  let index = parentMenu.children.indexOf(childMenu)
  parentMenu.children.splice(index, 1)
  emit('remove-menu', parentMenu, childMenu)

  let list = parentMenu.children.filter((menu) => menu.type !== 'add')
  if (list.length === 0) {
    parentMenu.selected = true
    parentMenu.type = 'click'
    selectedMenu.value = parentMenu
  } else {
    let minIndex = index - 1
    if (minIndex < 0) {
      minIndex = 0
    }

    parentMenu.children[minIndex].selected = true
    selectedMenu.value = parentMenu.children[minIndex]
  }
}

const removeAllMenuSelected = () => {
  localMenus.value.list.forEach((menu) => {
    menu.selected = false
    if (menu.children) {
      menu.children.forEach((childMenu) => {
        childMenu.selected = false
      })
    }
  })
}

/**
 * 构建一级菜单样式
 */
const buildRootMenuClass = (menu, list) => {
  return {
    'menu-item-add': menu.type === MENU_TYPE.ADD,
    selected: menu.selected,
    hide: (!editable || list.length > 3) && menu.type === MENU_TYPE.ADD,
  }
}

/**
 * 构建一级菜单样式
 */
const buildChildMenuClass = (menu, parentMenu) => {
  return {
    'menu-item-add': menu.type === MENU_TYPE.ADD,
    selected: menu.selected,
    hide: (!editable || parentMenu.children.length > 5) && menu.type === MENU_TYPE.ADD,
  }
}

/**
 * 初始化一级菜单
 */
const buildDefaultRootMenu = () => {
  let defaultMenu = { key: '', type: 'click', name: '新菜单', children: [] }
  defaultMenu.key = keyGenerator()
  defaultMenu.selected = true
  defaultMenu.children.push({ type: MENU_TYPE.ADD, name: '+添加', key: 'add' })
  return defaultMenu
}
</script>

<style lang="less" scoped>
.flex {
  display: flex;
  display: -webkit-flex;
  display: -webkit-box;
}

.flex-one {
  flex: 1;
  -webkit-flex: 1;
  -webkit-box-flex: 1;
}

.flex-box {
  align-items: center;
  -webkit-align-items: center;
  -webkit-box-align: center;
}

.flex-justify {
  justify-content: space-between;
  -webkit-justify-content: space-between;
  -webkit-box-pack: justify;
}

.flex-center {
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
}

.flex-direction {
  flex-direction: column;
  -webkit-flex-direction: column;
  -webkit-box-orient: vertical;
}

.display-row1 {
  display: -webkit-flex;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

@font-face {
  font-family: 'iconfont'; /* Project id 2778107 */
  src: url('data:font/ttf;charset=utf-8;base64,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')
    format('truetype');
}

.icon {
  font-family: 'iconfont', serif !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-user:before {
  content: '\e646';
}

.icon-keyboard:before {
  content: '\e608';
}

.icon-left:before {
  content: '\e62d';
}

.wechat-menu-editor {
  width: 375px;
  height: 500px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  background: #ebebeb no-repeat;
}

.wechat-menu-editor header .status-bar {
  height: 32px;
  padding: 0 16px;
  font-size: 12px;
  line-height: 32px;
  font-weight: bold;
}

.wechat-menu-editor header .status-bar .signal {
  margin-right: 4px;
}

.wechat-menu-editor header .status-bar .signal i {
  display: inline-block;
  background: #333;
  width: 2px;
  border-radius: 2px;
  margin-right: 1px;
  height: 10px;
}

.wechat-menu-editor header .status-bar .signal i:nth-child(1) {
  height: 4px;
}

.wechat-menu-editor header .status-bar .signal i:nth-child(2) {
  height: 6px;
}

.wechat-menu-editor header .status-bar .signal i:nth-child(3) {
  height: 8px;
}

.wechat-menu-editor header .status-bar .battery {
  width: 24px;
  background: #333;
  height: 12px;
  margin: 9px 4px;
  border-radius: 2px;
  position: relative;
}

.wechat-menu-editor header .status-bar .battery::after {
  content: ' ';
  position: absolute;
  background: #333;
  right: -2px;
  top: 4px;
  height: 4px;
  width: 2px;
  border-radius: 0 1px 1px 0;
}

.wechat-menu-editor header .title-bar {
  padding: 0 16px;
  line-height: 48px;
  font-size: 16px;
  font-weight: bold;
}

.wechat-menu-editor header .title-bar .icon {
  font-size: 18px;
}

.wechat-menu-editor footer {
  background: #f5f5f5;
  height: 48px;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.wechat-menu-editor footer .icon-keyboard {
  display: block;
  text-align: center;
  width: 48px;
  line-height: 48px;
  font-size: 32px;
}

.wechat-menu-editor footer .menus {
  position: absolute;
  left: 48px;
  right: 0;
  height: 48px;
  bottom: 0;
  display: flex;
}

.wechat-menu-editor footer .menus .menu-item {
  line-height: 48px;
  text-align: center;
  border-left: 1px solid #eee;
  flex-grow: 2;
  -webkit-flex-grow: 2;
  font-size: 12px;
  position: relative;
  background: #f5f5f5;
}

.wechat-menu-editor footer .menus .menu-item.selected {
  border: 1px solid #33cc5c;
}

.wechat-menu-editor footer .menus .menu-item.hide {
  display: none;
}

.wechat-menu-editor footer .menus .menu-item.menu-item-add {
  flex-grow: 1;
  -webkit-flex-grow: 1;
}

.wechat-menu-editor footer .menus .menu-item .del-area {
  display: none;
  position: absolute;
  //background-color: #00a65a;
  width: 40px;
  height: 30px;
  line-height: 30px;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  //border: 1px solid #909399;
  color: #72767b;
  border-radius: 30%;
  cursor: pointer;
}

.wechat-menu-editor footer .menus .menu-item.selected .del-area {
  display: block;
}

.wechat-menu-editor footer .menus .menu-item .del-area-right {
  display: none;
  position: absolute;
  //background-color: #00a65a;
  width: 40px;
  height: 20px;
  line-height: 20px;
  top: 0;
  right: 0;
  margin-left: 4px;
  transform: translateX(calc(100% + 5px)) translateY(50%);
  //border: 1px solid #909399;
  color: #72767b;
  border-radius: 30%;
  cursor: pointer;
}

.wechat-menu-editor footer .menus .menu-item.selected > .del-area-right {
  display: block;
}

.wechat-menu-editor footer .menus .menu-item .menu-children {
  position: absolute;
  bottom: 49px;
  border-radius: 4px;
  //overflow: hidden;
  width: 100%;
}

.wechat-menu-editor footer .menus .menu-item .menu-children .triangle-down {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #f5f5f5;
  margin: 0 auto;
}

.wechat-menu-editor footer .menus .menu-item .menu-children .menu-item {
  border: none;
  border-bottom: 1px solid #eee;
  line-height: 40px;
  color: #999999;
}

.wechat-menu-editor footer .menus .menu-item .menu-children .menu-item:nth-child(1) {
  border-radius: 4px 4px 0 0;
}

.wechat-menu-editor footer .menus .menu-item .menu-children .menu-item.selected {
  border: 1px solid #33cc5c;
  color: #33cc5c;
}
</style>
