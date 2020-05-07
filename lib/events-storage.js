export class EventsStorage {
  queue = new Set()

  get eventsQueue() {
    return this.queue
  }

  addEventToQueue(event) {
    this.queue.add(event)
  }

  async completedEvents() {
    return await Promise.all(
      // polyfill Promise.allSettled
      Array.from(this.eventsQueue).map((eventPromise) => {
        return eventPromise.then(
          (value) => {
            if (!value) {
              // manually reject errors from event processors
              return {
                status: 'rejected',
                reason:
                  // TODO: implement NUXT_TELEMETRY_DEV_DEBUG for debug events
                  'Error in event processor, try NUXT_TELEMETRY_DEV_DEBUG for debug'
              }
            }
            return { status: 'fulfilled', value }
          },
          (error) => {
            // other errors
            return { status: 'rejected', reason: error }
          }
        )
      })
    )
  }
}