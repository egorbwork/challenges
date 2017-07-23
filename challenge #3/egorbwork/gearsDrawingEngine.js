class GearDrawingEngine {
    constructor(drawingContext) {
        this.drawingContext = drawingContext;
        this.drawingContext.translate(200, 200);
        this.drawingContext.lineWidth = 5;
        this.chainColor = '#202020';
        this.gearCenterColor = '#85827F';
        this.gearMainColor = '#63615E';
        this.gearEdgeColor = '#85827F';
    }

    draw(circles = []) {
        this.drawingContext.save();
        for (let circleCoordinates of circles) {
            this.drawingContext.beginPath();
            this.drawingContext.arc(circleCoordinates.x, circleCoordinates.y, circleCoordinates.r, 0, 2 * Math.PI, false);
            this.drawingContext.lineWidth = 5;
            this.drawingContext.strokeStyle = this.gearEdgeColor;
            this.drawingContext.stroke();
            this.drawingContext.closePath();
        }
        this.drawingContext.restore();
        let outerTangentsCoordinates = this.generateOuterTangentsCoordinates(circles[0], circles[1]);
        let innerTangentsCoordinates = this.generateInnerTangentsCoordinates(circles[0], circles[1]);
    }

    generateOuterTangentsCoordinates(firstCircle, secondCircle) {
        // https://en.wikipedia.org/wiki/Tangent_lines_to_circles
        // Solves only some local cases, didn't analyze all options
        let secondPositionXStatus = (firstCircle.y === secondCircle.y && firstCircle.r > secondCircle.r)? 1 : -1;
        let secondPositionYStatus = (firstCircle.x === secondCircle.x && firstCircle.r > secondCircle.r)? 1 : -1;
        /**
         * x3 = x1 + r*cos(pi/2 - alfa)
         * y3 = y1 + r*sin(pi/2 - alfa)
         * x4 = x2 + R*cos(pi/2 - alfa)
         * y4 = y2 + R*sin(pi/2 - alfa)
         * alfa = gama - beta
         * gama = arctan((y1-y2)/(x2-x1))
         * beta = arcsin((R-r)/(hypo(x2-x1, y2 - y1)))
         */
        let angleGama = Math.atan((firstCircle.y - secondCircle.y) / (secondCircle.x - firstCircle.x));
        let angleBeta = Math.asin((secondCircle.r - firstCircle.r) / Math.hypot(secondCircle.x - firstCircle.x, secondCircle.y - firstCircle.y));
        let angleAlfa = angleGama - angleBeta;

        // first tangent
        let rightTangentFirstCirclePoint = new Point(
            firstCircle.x + firstCircle.r * Math.cos(Math.PI/2 - angleAlfa),
            firstCircle.y + firstCircle.r * Math.sin(Math.PI/2 - angleAlfa)
        );
        let rightTangentSecondCirclePoint = new Point(
            secondCircle.x + secondCircle.r * Math.cos(Math.PI/2 - angleAlfa),
            secondCircle.y + secondCircle.r * Math.sin(Math.PI/2 - angleAlfa)
        );
        this.drawLine(rightTangentFirstCirclePoint, rightTangentSecondCirclePoint);

        // second tangent
        let leftTangentFirstCirclePoint = new Point(
            firstCircle.x + secondPositionXStatus * firstCircle.r * Math.cos(Math.PI/2 - angleAlfa),
            firstCircle.y + secondPositionYStatus * firstCircle.r * Math.sin(Math.PI/2 - angleAlfa)
        );
        let leftTangentSecondCirclePoint = new Point(
            secondCircle.x + secondPositionXStatus * secondCircle.r * Math.cos(Math.PI/2 - angleAlfa),
            secondCircle.y + secondPositionYStatus * secondCircle.r * Math.sin(Math.PI/2 - angleAlfa)
        );
        this.drawLine(leftTangentFirstCirclePoint, leftTangentSecondCirclePoint);

        return {
            rightTangent: {
                firstCirclePoint: rightTangentFirstCirclePoint,
                secondCirclePoint: rightTangentSecondCirclePoint
            },
            leftTangent: {
                firstCirclePoint: leftTangentFirstCirclePoint,
                secondCirclePoint: leftTangentSecondCirclePoint
            }
        }
    }

    generateInnerTangentsCoordinates(firstCircle, secondCircle) {
        // Not found yet for X
        let positionXStatus = 1;
        // Works for some of local examples
        let positionYStatus = (firstCircle.x > secondCircle.x && firstCircle.y > secondCircle.y)? -1 : 1;

        /**
         * http://www.cyberforum.ru/free-pascal/thread2013844.html
         */
        let tangentIntersectionPoint = new Point(
            firstCircle.x + firstCircle.r * (secondCircle.x - firstCircle.x) / (firstCircle.r + secondCircle.r),
            firstCircle.y + firstCircle.r * (secondCircle.y - firstCircle.y) / (secondCircle.r + firstCircle.r)
        );
        // first circle
        let distanceFromIntersectionToFirstCircleCenter = Math.sqrt((firstCircle.x - tangentIntersectionPoint.x) ** 2 + (firstCircle.y - tangentIntersectionPoint.y) ** 2);
        let intersectionToFirstCircleCenterRelatedHypotenuse = Math.hypot(distanceFromIntersectionToFirstCircleCenter, firstCircle.r);
        let intersectionToFirstCircleCenterRelatedFirstAngle =  Math.asin((firstCircle.x - tangentIntersectionPoint.x) / distanceFromIntersectionToFirstCircleCenter);
        let intersectionToFirstCircleCenterRelatedSecondAngle =  Math.asin((-firstCircle.r) / distanceFromIntersectionToFirstCircleCenter);
        let firstCircleUpperPoint = new Point(
            tangentIntersectionPoint.x + positionXStatus * intersectionToFirstCircleCenterRelatedHypotenuse * Math.sin(intersectionToFirstCircleCenterRelatedFirstAngle - intersectionToFirstCircleCenterRelatedSecondAngle),
            tangentIntersectionPoint.y - positionYStatus * intersectionToFirstCircleCenterRelatedHypotenuse * Math.cos(intersectionToFirstCircleCenterRelatedFirstAngle - intersectionToFirstCircleCenterRelatedSecondAngle)
        );
        let firstCircleLowerPoint = new Point(
            tangentIntersectionPoint.x + positionXStatus * intersectionToFirstCircleCenterRelatedHypotenuse * Math.sin(intersectionToFirstCircleCenterRelatedFirstAngle + intersectionToFirstCircleCenterRelatedSecondAngle),
            tangentIntersectionPoint.y - positionYStatus * intersectionToFirstCircleCenterRelatedHypotenuse * Math.cos(intersectionToFirstCircleCenterRelatedFirstAngle + intersectionToFirstCircleCenterRelatedSecondAngle)
        );
        // second circle
        let distanceFromIntersectionToSecondCircleCenter = Math.sqrt((secondCircle.x - tangentIntersectionPoint.x) ** 2 + (secondCircle.y - tangentIntersectionPoint.y) ** 2);
        let intersectionToSecondCircleCenterRelatedHypotenuse = Math.hypot(distanceFromIntersectionToSecondCircleCenter, secondCircle.r);
        let intersectionToSecondCircleCenterRelatedFirstAngle =  Math.asin((secondCircle.x - tangentIntersectionPoint.x) / distanceFromIntersectionToSecondCircleCenter);
        let intersectionToSecondCircleCenterRelatedSecondAngle =  Math.asin((-secondCircle.r) / distanceFromIntersectionToSecondCircleCenter);
        let secondCircleUpperPoint = new Point(
            tangentIntersectionPoint.x + positionXStatus * intersectionToSecondCircleCenterRelatedHypotenuse * Math.sin(intersectionToSecondCircleCenterRelatedFirstAngle - intersectionToSecondCircleCenterRelatedSecondAngle),
            tangentIntersectionPoint.y + positionYStatus * intersectionToSecondCircleCenterRelatedHypotenuse * Math.cos(intersectionToSecondCircleCenterRelatedFirstAngle - intersectionToSecondCircleCenterRelatedSecondAngle)
        );
        let secondCircleLowerPoint = new Point(
            tangentIntersectionPoint.x + positionXStatus *intersectionToSecondCircleCenterRelatedHypotenuse * Math.sin(intersectionToSecondCircleCenterRelatedFirstAngle + intersectionToSecondCircleCenterRelatedSecondAngle),
            tangentIntersectionPoint.y + positionYStatus * intersectionToSecondCircleCenterRelatedHypotenuse * Math.cos(intersectionToSecondCircleCenterRelatedFirstAngle + intersectionToSecondCircleCenterRelatedSecondAngle)
        );
        this.drawLine(firstCircleUpperPoint, secondCircleLowerPoint);
        this.drawLine(firstCircleLowerPoint, secondCircleUpperPoint);

        return {
            rightTangent: {
                firstCirclePoint: firstCircleUpperPoint,
                secondCirclePoint: secondCircleLowerPoint
            },
            leftTangent: {
                firstCirclePoint: firstCircleLowerPoint,
                secondCirclePoint: secondCircleUpperPoint
            }
        }
    }

    /**
     *
     * @param Point firstPoint
     * @param Point secondPoint
     */
    drawLine(firstPoint, secondPoint) {
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(firstPoint.x, firstPoint.y);
        this.drawingContext.lineTo(secondPoint.x, secondPoint.y);
        this.drawingContext.stroke();
        this.drawingContext.closePath();
    }
}
