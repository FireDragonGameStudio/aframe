/* global AFRAME, THREE */
AFRAME.registerComponent("pinchable", {
    schema: {
        pinchDistance: { default: 0.1 },
    },

    init: function () {
        var sceneEl = this.el.sceneEl;
        this.worldPosition = new THREE.Vector3();
        this.bindMethods();
        this.pinched = false;
        this.isGrabbed = false;
        sceneEl.addEventListener("pinchstarted", this.onPinchStarted);
        sceneEl.addEventListener("pinchended", this.onPinchEnded);
        sceneEl.addEventListener("pinchmoved", this.onPinchMoved);
        // check for gesture grip recognition
        sceneEl.addEventListener("gesturestarted", this.onGestureStarted);
        sceneEl.addEventListener("gestureended", this.onGestureEnded);
        sceneEl.addEventListener("gesturemoved", this.onGestureMoved);
    },

    bindMethods: function () {
        this.onPinchStarted = this.onPinchStarted.bind(this);
        this.onPinchEnded = this.onPinchEnded.bind(this);
        this.onPinchMoved = this.onPinchMoved.bind(this);
        // register gesture events
        this.onGestureStarted = this.onGestureStarted.bind(this);
        this.onGestureEnded = this.onGestureEnded.bind(this);
        this.onGestureMoved = this.onGestureMoved.bind(this);
    },

    onPinchStarted: function (evt) {
        var pinchDistance = this.calculatePinchDistance(evt.detail.position);
        if (pinchDistance < this.data.pinchDistance) {
            this.el.emit("pinchedstarted");
            this.pinched = true;
        }
    },

    onGestureStarted: function (evt) {
        var pinchDistance = this.calculatePinchDistance(evt.detail.position);
        if (pinchDistance < this.data.pinchDistance && evt.detail.gestureName == "Grip") {
            this.el.emit("grabbedstarted");
            this.isGrabbed = true;
        }
    },

    calculatePinchDistance: function (pinchWorldPosition) {
        var el = this.el;
        var worldPosition = this.worldPosition;
        var pinchDistance;

        worldPosition.copy(el.object3D.position);
        el.object3D.parent.updateMatrixWorld();
        el.object3D.parent.localToWorld(worldPosition);

        pinchDistance = worldPosition.distanceTo(pinchWorldPosition);

        return pinchDistance;
    },

    onPinchEnded: function (evt) {
        if (this.pinched) {
            this.pinched = false;
            this.el.emit("pinchedended");
        }
    },

    onGestureEnded: function (evt) {
        if (this.isGrabbed && evt.detail.gestureName == "Grip") {
            this.isGrabbed = false;
            this.el.emit("grabbedended");
        }
    },

    onPinchMoved: function (evt) {
        var el = this.el;
        var pinchDistance = this.calculatePinchDistance(evt.detail.position);
        if (!this.pinched) {
            return;
        }
        if (pinchDistance < this.data.pinchDistance) {
            el.emit("pinchedmoved", evt.detail);
        } else {
            this.pinched = false;
            el.emit("pinchedended");
        }
    },

    onGestureMoved: function (evt) {
        var el = this.el;
        if (!this.isGrabbed) {
            return;
        }
        if (evt.detail.gestureName == "Grip") {
            el.emit("grabbedmoved", evt.detail);
        } else {
            this.isGrabbed = false;
            el.emit("grabbedended");
        }
    },
});
