class Update {
    constructor(payload, nextUpdate) {
        this.payload = payload
        this.nextUpdate = nextUpdate
    }
}
class updateQueue {
    constructor() {
        this.baseState = null;
        this.firstUpdate = null;
        this.lastUpdate = null
    }
    enqueueUpdate(update) {
        if (this.firstUpdate === null) {
            this.firstUpdate = this.lastUpdate = update
        } else {
            this.lastUpdate.nextUpdate = update
            this.lastUpdate = update
        }

    }
    forceUpdate() {
        let currentState = this.baseState || {}
        let currentUpdate = this.firstUpdate;
        while (currentUpdate) {
            let nextState = typeof currentUpdate.payload === 'function' ? currentUpdate.payload(currentState) : currentUpdate.payload
            currentState = {...currentState, ...nextState }
            currentUpdate = currentUpdate.nextUpdate
        }
        this.firstUpdate = this.lastUpdate = null
        this.baseState = currentUpdate
        return currentState
    }
}
let queue = new updateQueue()
queue.enqueueUpdate(new Update({ name: '888' }))
queue.enqueueUpdate(new Update({ v: 999 }))
queue.enqueueUpdate(new Update({ nubmer: 0 }))
queue.enqueueUpdate(new Update((state) => ({ nubmer: state.nubmer + 1 })))
queue.enqueueUpdate(new Update((state) => ({ nubmer: state.nubmer + 1 })))
console.info(queue.forceUpdate())