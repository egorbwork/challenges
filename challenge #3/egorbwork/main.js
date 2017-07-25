document.addEventListener("DOMContentLoaded", function() {
    var gearDrawingEngine = new GearDrawingEngine(document.getElementById('gears').getContext('2d'));
    gearDrawingEngine.draw(
        [{
            x: 0,
            y: 0,
            r: 16
        }, {
            x: 100,
            y: 0,
            r: 16
        }, {
            x: 100,
            y: 100,
            r: 12
        }, {
            x: 50,
            y: 50,
            r: 24
        }, {
            x: 0,
            y: 100,
            r: 12
        }]
    );
});
