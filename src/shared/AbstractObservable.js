/**
 * Abstract class for observable object
 */
export default class AbstractObservable {
  #observers = [];

  /**
   * @returns {Array} all observers
   */
  get observers() {
    return this.#observers;
  }

  /**
   * Add an observer to this
   * @param {Object} observer observer to add
   */
  addObserver(observer) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer);
    }
  }

  /**
   * Remove an observer from this.
   * @param {object} observer observer to remove
   */
  removeObserver(observer) {
    const removeIndex = this.#observers.findIndex((obs) => observer === obs);

    if (removeIndex !== -1) {
      this.#observers.splice(removeIndex, 1);
    }
  }

  /**
   * Remove all observers
   */
  removeAllObservers() {
    this.#observers = [];
  }

  /**
   * Loops over this.observers and calls the update method on each observer.
   * The state object will call this method everytime it is updated.
   */
  notify() {
    if (this.#observers.length > 0) {
      this.#observers.forEach((observer) => {
        if (typeof observer === 'function') {
          observer();
        }
      });
    }
  }
}
