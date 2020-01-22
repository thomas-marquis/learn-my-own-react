import {createElement} from './didact/vdom.js'
import {createDom, updateDom} from './didact/dom.js'

const DELETION_TAG = 'DELETION';
const PLACEMENT_TAG = 'PLACEMENT';
const UPDATE_TAG = 'UPDATE';

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletions = []

/** hooks */
let hookIndex = null
/** @type {Fiber} */
let wipFiber = null

/**
 * @typedef Hook
 * @property {*} state
 */

/**
 * @typedef Fiber
 * @property {Fiber} alternate
 * @property {string | Function} type
 * @property {Fiber} parent
 * @property {Fiber} child
 * @property {{}} props
 * @property {DELETION_TAG | PLACEMENT_TAG | UPDATE_TAG} effectTag
 * @property {array<Hook>} hooks
 */

/**
 *
 * @param element
 * @param {Node} container
 */
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
        children: [element]
    },
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot
  deletions = []
}

/**
 *
 * @param {Fiber} wipFiber
 * @param {array} elements
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let prevSibling = null
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let newFiber = null

  while (index < elements.length || oldFiber) {
    const element = elements[index]
    const sameType = oldFiber && element && oldFiber.type === element.type

    // console.log(element, sameType, oldFiber, [...deletions]);

    if (sameType) {// modification d'un élément
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom, // on recycle le dom
        alternate: oldFiber,
        effectTag: UPDATE_TAG
      }
    }

    if (element && !sameType) { // ajout d'un élément
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null, // le dom n'xiste pas encore
        alternate: null,
        effectTag: PLACEMENT_TAG
      }
    }

    if (oldFiber && !sameType) { // suppression d'un élément
      oldFiber.effectTag = DELETION_TAG
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

/**
 *
 * @param {Fiber} fiber
 * @returns {?Fiber}
 */
function performUnitOfWork(fiber) {
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

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

/**
 *
 * @param {Fiber} fiber
 */
function updateHostComponent(fiber) {
  if (!fiber.dom) { // si aucun élément du dom ne correspond
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children

  reconcileChildren(fiber, elements)
}

/**
 *
 * @param {Fiber} fiber
 */
function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []

  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function useState (initValue) {
  const oldHooks = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  /** @type {Hook} */
  const hook = {
    state: oldHooks ? oldHooks.state: initValue
  }
  wipFiber.hooks.push(hook)

  const setState = state => {
    hook.state = state
    render(currentRoot.props.children[0], currentRoot.dom)
  }

  hookIndex++
  return [hook.state, setState]
}

/**
 *
 * @param {Fiber} fiber
 * @param {Node} domParent
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

/**
 *
 * @param {Fiber} fiber
 */
function commitWork(fiber) {
  if (!fiber) return

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (fiber.effectTag === PLACEMENT_TAG && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)

  } else if (fiber.effectTag === DELETION_TAG) {
    commitDeletion(fiber, domParent)
    return

  } else if (fiber.effectTag === UPDATE_TAG && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    domParent.appendChild(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function workLoop(deadline) {
  let shouldYield = false

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

window.Didact = {
  createElement,
  render,
  useState
}
