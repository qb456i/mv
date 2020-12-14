function MV(options = {}) {
    this.$options = options
    let data = this._data = this.$options.data
    observer(data)
    for (let key in data) { //数据劫持
        Object.defineProperty(this, key, {
            enumerable: true,
            get() {
                return this._data[key]
            },
            set(newVal) {
                this._data[key] = newVal
            }
        })
    }
    initComputed.call(this)
    new Compine(options.el, this)
}

function initComputed() {
    let vm = this
    let computed = this.$options.computed
    Object.keys(computed).forEach(key => {
        Object.defineProperty(vm, key, {
            get: computed[key]
        })

    })
}

function Observer(data) { //监听
    let dep = new Dep()
    for (const key in data) {
        let val = data[key]
        observer(val)
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                Dep.target && dep.addsub(Dep.target)
                return val
            },
            set(newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal
                observer(newVal)
                dep.notify()
            }
        })
    }
}

function observer(data) {
    if (typeof data !== 'object') return
    return new Observer(data)
}

function Compine(el, vm) { //编译
    vm.$el = document.querySelector(el)
    let fragment = document.createDocumentFragment()
    while (child = vm.$el.firstChild) {
        fragment.appendChild(child)
    }
    replace(fragment)

    function replace(fragment) { //替换模板
        Array.from(fragment.childNodes).forEach((node) => {
            let text = node.textContent
            let reg = /\{\{(.*)\}\}/;
            if (node.nodeType === 3 && reg.test(text)) {
                let arr = RegExp.$1.split('.')
                let val = vm
                arr.forEach((key) => {
                    val = val[key]
                })
                new Watcher(vm, RegExp.$1, function(newVal) {
                    node.textContent = text.replace(reg, newVal)
                })
                node.textContent = text.replace(reg, val)
            }
            if (node.nodeType === 1) {
                let nodeAttrs = node.attributes
                Array.from(nodeAttrs).forEach((attr) => {
                    let n = attr.name
                    let v = attr.value
                    if (n.indexOf('v-') === 0) {
                        let arr = RegExp.$1.split('.')
                        let val = vm
                        arr.forEach((key) => {
                            val = val[key]
                        })
                        new Watcher(vm, RegExp.$1, function(newVal) {
                            node.value = newVal
                        })
                        node.value = val
                    }
                })
            }
            if (node.childNodes) {
                replace(node)
            }
        })
    }

    vm.$el.appendChild(fragment)
}

function Dep() { //发布订阅
    this.subs = []
}
Dep.prototype.addsub = function(sub) { //订阅
    this.subs.push(sub)
}
Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update())
}

function Watcher(vm, exp, fn) {
    this.vm = vm;
    this.exp = exp
    this.fn = fn;
    Dep.target = this
    let val = vm
    let arr = exp.split('.')
    arr.forEach((k) => {
        val = val[k]
    })
    Dep.target = null
}
Watcher.prototype.update = function() {
    let val = this.vm
    let arr = this.exp.split('.')
    arr.forEach((k) => {
        val = val[k]
    })
    this.fn(val)
}