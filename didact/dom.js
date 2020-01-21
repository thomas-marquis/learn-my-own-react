/**
 *
 * @param {string} name
 * @returns {boolean}
 */
const isProperty = name => name !== 'children'
/**
 *
 * @param {string} name
 * @returns {boolean}
 */
const isEvent = name => name.startsWith('on')
/**
 *
 * @param {string} name
 * @returns {string}
 */
const getEventName = name => name.toLowerCase().substring(2)

/**
 *
 * @param {string} type
 * @param {{}} props
 * @returns {Text | Node}
 */
export function createDom({type, props}) {
  const dom = type === 'TEXT_ELEMENT' ?
    document.createTextNode(props.nodeValue)
    : document.createElement(type)

  Object.keys(props).forEach(name => {
    if (isProperty(name)) {
      if (isEvent(name)) {
        dom.addEventListener(getEventName(name), props[name])
      } else {
        dom[name] = props[name]
      }
    }
  })

  return dom
}

/**
 *
 * @param {Node} dom
 * @param {{}} prevProps
 * @param {{}} nextProps
 */
export function updateDom(dom, prevProps, nextProps) {
  // supprime les anciennes props
  Object.keys(prevProps)
    .filter(isProperty)
    .forEach(name => {
      if(!(name in nextProps)) {
        if (isEvent(name)) {
          dom.removeEventListener(getEventName(name), prevProps[name])
        } else {
          dom[name] = ''
        }
      }
    })

  // ajoute ou modifie les nouvelles props
  Object.keys(nextProps)
    .filter(isProperty)
    .forEach(name => {
      if (prevProps[name] !== nextProps[name]) {
        if (isEvent(name)) {
          if (prevProps[name]) {
            dom.removeEventListener(getEventName(name), prevProps[name])
          }
          dom.addEventListener(getEventName(name), nextProps[name])
        } else {
          dom[name] = nextProps[name]
        }
      }
    })
}
