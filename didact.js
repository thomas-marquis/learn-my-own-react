import {createElement} from './didact/vdom.js'
import {createDom} from './didact/dom.js'

let nextUnitOfWork = null

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
        children: [element]
    }
  }
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) { // si aucun élément du dom ne correspond
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) { // si la fibre à un parent, on lui ajoute le dom que l'on vient de générer
    fiber.parent.dom.appendChild(fiber.dom)
  }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  console.log('fiber', fiber);

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }

  return null;
}

function workLoop(deadline) {
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

window.Didact = {
  createElement,
  render
}
