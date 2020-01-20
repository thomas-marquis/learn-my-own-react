import {createElement} from './didact/vdom.js'


function render({type, props}, container) {
  const dom = type === 'TEXT_ELEMENT' ?
    document.createTextNode(props.nodeValue)
    : document.createElement(type)

  props.children.forEach(child => {
    render(child, dom)
  })

  Object.keys(props).forEach(name => {
    if (name !== 'children') {
      dom[name] = props[name]
    }
  })

  container.appendChild(dom)
}

window.Didact = {
  createElement,
  render
}
