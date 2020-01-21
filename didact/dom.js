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

const isProperty = name => name !== 'children'

export function updateDom(dom, prevProps, nextProps) {
  // supprime les anciennes props
  Object.keys(prevProps)
    .filter(isProperty)
    .forEach(name => {
      if(!(name in nextProps)) {
        dom[name] = ''
      }
    })

  // ajoute ou modifie les nouvelles props
  Object.keys(nextProps)
    .filter(isProperty)
    .forEach(name => {
      if (prevProps[name] !== nextProps[name]) {
        dom[name] = nextProps[name]
      }
    })
}
