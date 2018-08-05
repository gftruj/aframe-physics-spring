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
    let el = this.el
    this.spring = null
    if (this.el.body) {
      this.createSpring()
    } else {
      this.el.addEventListener("body-loaded", () => {
        this.createSpring()
      })
    }
  },
  update: function(oldData, newData) {
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
    this.el.sceneEl.systems.physics.driver.world.addEventListener("postStep", (event) => {
      this.spring.applyForce();
    });
  },
  dataIsValid: function(data) {
    if (!data.target) return false
    return true
  }
})
