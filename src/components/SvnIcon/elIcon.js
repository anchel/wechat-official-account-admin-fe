import { h, defineComponent, resolveComponent } from 'vue'

export function UseElIcon(icon, color = 'inherit', size) {
  return defineComponent({
    name: 'UseElIcon',
    render() {
      // return h(resolveComponent(icon))
      return h(
        resolveComponent('el-icon'),
        {
          color: color,
          size: size || '',
        },
        () => [h(resolveComponent(icon))],
      )
    },
  })
}
