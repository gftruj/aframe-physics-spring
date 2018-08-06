if (typeof AFRAME === 'undefined') {
	throw new Error('Component attempted to register before a-frame was available');
}

if (typeof CANNON === 'undefined') {
	throw new Error('Component attempted to register before the a-frame physics system was available');
}

AFRAME.registerComponent("spring", {

  multiple: true,

  schema: {

    // Target (other) body for the constraint.
    target: {type: 'selector'},

    // Lenght of the spring, when no force acts upon it
    restLength: {default: 1, min: 0},

    // how much will the spring suppress the force
    stiffness: {default: 100, min: 0, max: 0},

    // the stretch factor of the spring
    damping: {default: 1, min: 0, max: 1},
  },

  init: function() {
    this.system = this.el.sceneEl.systems.physics
    this.world = this.system.driver.world
    this.spring = /* {CANNON.Constraint} */ null
  },

  update: function(oldData, newData) {
    var el = this.el,
    data = this.data;
    
    // wait until the CANNON body is created and attached
    if (!el.body || !data.target.body) {
      (el.body ? data.target : el).addEventListener('body-loaded', this.update.bind(this, {}));
      return;
    }

    // create the spring if necessary (nonexistent)
    this.createSpring()
    // apply new schema to the spring
    this.updateSpring(oldData)
  },

  updateSpring: function(oldData) {
    if (!this.spring) {
      console.warn("Component attempted to change spring before its created. No changes made.");
      return;
    } 
    var data = this.data,
    spring = this.spring
    if (!data.target) {
      console.warn("Invalid target specified. No changes made.");
      return;
    }
    // Cycle through the schema and check if an attribute has changed.
    // if so, apply it to the spring
    Object.keys(data).forEach(function(attr) {
      if (data[attr] !== oldData[attr]) {
        if (attr === "target") {
          // special case for the target selector
          spring.bodyB = data.target.body
          return
        }
        spring[attr] = data[attr]
      }
    })
  },

  createSpring: function() {
    // no need to create a new spring
    if (this.spring) return
    var data = this.data
    if (!this.dataIsValid(data)) return;
    this.spring = new CANNON.Spring(this.el.body, data.target.body, {
      restLength: data.restLength,
      stiffness: data.stiffness,
      damping: data.damping,
    });
    // Compute the force after each step
    this.world.addEventListener("postStep", this.updateSpringForce.bind(this, {}));
  },

  // If the spring is valid, update the force each tick the physics are calculated
  updateSpringForce: function() {
    if (this.spring) {
       this.spring.applyForce()
    }
  },

  // as for now only check if there is another body to attach
  dataIsValid: function(data) {
    if (!data.target) return false
    return true
  },

  // resume updating the force when component upon calling play()
  play: function() {
    this.world.addEventListener("postStep", this.updateSpringForce.bind(this, {}));
  },

  // stop updating the force when component upon calling stop()
  pause: function() {
    this.world.removeEventListener("postStep", this.updateSpringForce.bind(this, {}));
  },

  //remove the event listener + delete the spring
  remove: function() {
    this.world.removeEventListener("postStep", this.updateSpringForce.bind(this, {}));
    if (this.spring)
      delete this.spring
      this.spring = null
  }
})
