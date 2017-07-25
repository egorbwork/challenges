class Gear {
    constructor(circle = {}) {
        this.x = circle.x || 0;
        this.y = circle.y || 0;
        this.r = circle.r || 0;
        this.previousGear = null;
        this.nextGear = null;
        this.nextTangent = null;
        this.nextGearHorizontalPosition = positionEnum.same;
        this.nextGearVerticalPosition = positionEnum.same;
    }

    setPreviousGear(gear) {
        this.previousGear = gear;
        gear.nextGear = this;
        if (this.x > gear.x) {
            gear.nextGearHorizontalPosition = positionEnum.right;
        } else if (this.x < gear.x) {
            gear.nextGearHorizontalPosition = positionEnum.left;
        }
        if (this.y > gear.y) {
            gear.nextGearVerticalPosition = positionEnum.top;
        } else if (this.y < gear.y) {
            gear.nextGearVerticalPosition = positionEnum.bottom;
        }
    }
}
