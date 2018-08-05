/* globals AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME' +
    ' was available.');
}

/* globals CANNON */
if (typeof CANNON === 'undefined') {
  throw new Error('Component attempted to register before Cannon.js' +
    ' was available.');
}

AFRAME.registerComponent("spring", {
  schema: {
    target: {
      type: 'selector'
    },
    restLength: {
      default: 1
    },
    stiffness: {
      default: 100
    },
    damping: {
      default: 1
    },
  },
  dependencies: ['physics'],
  multiple: true,
  init: function() {
    this.system = this.el.sceneEl.systems.physics
    this.world = this.system.driver.world
    this.spring = null
  },
  update: function(oldData, newData) {
    var el = this.el,
    data = this.data;
     
    if (!el.body || !data.target.body) {
      (el.body ? data.target : el).addEventListener('body-loaded', this.update.bind(this, {}));
      return;
    }
    this.createSpring()
    this.updateSpring(oldData)
  },
  updateSpring: function(oldData) {
    let data = this.data
    if (!this.spring) {
      console.warn("Component attempted to change spring before its created. No changes made.");
      return;
    } else if (!data.target) {
      console.warn("Invalid target specified. No changes made.");
      return;
    }
    Object.keys(data).forEach((attr) => {
      if (data[attr] !== oldData[attr]) {
        if (attr === "target") {
          this.spring.bodyB = data.target.body
          return
        }
        this.spring[attr] = data[attr]
      }
    })
  },
  createSpring: function() {
    let data = this.data
    if (!this.dataIsValid(data)) return;
    this.spring = new CANNON.Spring(this.el.body, data.target.body, {
      restLength: data.restLength,
      stiffness: 100,
      damping: 1,
    });
    // Compute the force after each step
    this.world.addEventListener("postStep", this.updateSpringForce.bind(this, {}));
  },
  updateSpringForce: function() {
    if (this.spring) {
       this.spring.applyForce()
    }
  },
  dataIsValid: function(data) {
    if (!data.target) return false
    return true
  },
  play: function() {
    this.world.addEventListener("postStep", this.updateSpringForce.bind(this, {}));
  },
  pause: function() {
    this.world.removeEventListener("postStep", this.updateSpringForce.bind(this, {}));
  },
  remove: function() {
    this.world.removeEventListener("postStep", this.updateSpringForce.bind(this, {}));
    if (this.spring)
      delete this.spring
      this.spring = null
  }
})
