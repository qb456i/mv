//简单比对，仅实现前面插入或者后面插入
let vn = h('div', {},
    h('li', { style: { background: 'blue' }, key: 'A' }, 'A'),
)
render(vn, document.getElementById('app'))
let newVnode = h('div', {},
    h('li', { style: { background: 'red' }, key: 'C' }, 'C'),
    h('li', { style: { background: 'red' }, key: 'A', id: 'a' }, 'A'),
)
setTimeout(() => {
    patch(vn, newVnode)
}, 2000)

//render
function render(vnode, container) {
    let ele = createDomElement(vnode)
    container.appendChild(ele)
}
//创建虚拟dom
function createDomElement(vnode) {
    let { type, props, key, children, text } = vnode
    if (type) {
        vnode.domElement = document.createElement(type)
        updateProperties(vnode)
        children.map((childVnode) => render(childVnode, vnode.domElement))
    } else {
        vnode.domElement = document.createTextNode(text)
    }
    return vnode.domElement
}

//比对属性
function updateProperties(newVode, oldProps = {}) {
    let domElement = newVode.domElement //真实的dom元素
    let newProps = newVode.props //当前虚拟节点属性
        //老的里面有，新的里面没有，则移除老的属性
    for (let oldPropsName in oldProps) {
        if (!newProps[oldPropsName]) {
            delete domElement[oldPropsName]
        }
    }
    let oldStyleObj = oldProps.style || {}
    let newStyleObj = newProps.style || {}
    for (let propName in oldStyleObj) {
        if (!newStyleObj[propName]) {
            domElement.style[propName] = ''

        }
    }
    //新的有，老的没有覆盖老的
    for (let newPropsName in newProps) {

        if (newPropsName === 'style') {
            let styleObj = newProps.style
            for (let s in styleObj) {

                domElement.style[s] = styleObj[s]
            }
        } else {
            domElement[newPropsName] = newProps[newPropsName]
        }

    }
}
//生成虚拟dom对象
function h(type, props = {}, ...children) {
    let key
    if (props.key) {
        key = props.key
        delete props.key
    }
    children = children.map(child => {
        if (typeof child === 'string') {
            return vnode(undefined, undefined, undefined, undefined, child)
        } else {
            return child
        }
    })
    return vnode(type, props, key, children)
}
//返回虚拟dom对象
function vnode(type, props, key, children, text) {
    return {
        type,
        props,
        key,
        children,
        text
    }
}

function patch(oldVnode, newVnode) {

    if (oldVnode.type !== newVnode.type) {
        return oldVnode.domElement.parentNode.replaceChild(createDomElement(newVnode), oldVnode.domElement)
    }
    if (oldVnode.text) {
        return oldVnode.domElement.textContent = newVnode.text
    }
    let domElement = newVnode.domElement = oldVnode.domElement

    //类型一样，并且标签一样更新老节点属性
    updateProperties(newVnode, oldVnode.props)
    let oldChildren = oldVnode.children
    let newChildren = newVnode.children
    if (oldChildren.length > 0 && newChildren.length > 0) {
        upDateChildren(domElement, oldChildren, newChildren)
    } else if (oldChild.length > 0) {
        domElement.innerHTML = ''
    } else if (newChildren.length > 0) {
        for (let i = 0; i < newChildren.length; i++) {
            domElement.appendChild(createDomElement(newChildren[i]))
        }
    }

}

function isSame(oldVnode, newVnode) {
    return oldVnode.key === newVnode.key && oldVnode.type === newVnode.type
}

function upDateChildren(parent, oldChildren, newChildren) {
    let oldStartIndex = 0
    let oldStartVnode = oldChildren[0]
    let oldEndIndex = oldChildren.length - 1
    let oldEndVnode = oldChildren[oldEndIndex]
    let newStartIndex = 0
    let newStartVnode = newChildren[0]
    let newEndIndex = newChildren.length - 1
    let newEndVnode = newChildren[newEndIndex]
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (isSame(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSame(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode)
            oldStartVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[--newEndIndex]
        }
    }
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let beforeElement = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].domElement
            parent.insertBefore(createDomElement(newChildren[i]), beforeElement)
        }
    }
}