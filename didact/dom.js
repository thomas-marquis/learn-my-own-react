export function createDom({type, props}) {
  const dom = type === 'TEXT_ELEMENT' ?
    document.createTextNode(props.nodeValue)
    : document.createElement(type)

  Object.keys(props).forEach(name => {
    if (name !== 'children') {
      dom[name] = props[name]
    }
  })

  return dom
}
