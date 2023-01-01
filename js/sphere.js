var container = d3.select('#sphere');
var dimension = container.node().getBoundingClientRect();

var width = Math.min(window.innerWidth, window.innerHeight);
var height = width;

var innerRadius = width / 2;
var angle = 290;

var geoProjection = d3.geoOrthographic()
    .scale(innerRadius)
    .rotate([angle, 0])
    .translate([width / 2, width / 2])
    .clipAngle(90);
var geoPath = d3.geoPath()
    .projection(geoProjection);

var svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

var center = geoProjection.translate();
var edge = geoProjection([-90, 90]);
var r = Math.pow(Math.pow(center[0] - edge[0], 2) + Math.pow(center[1] - edge[1], 2), 0.5);

svg.append('defs')
    .append('clipPath')
    .append('circle')
    .attr('id', 'edgeCircle')
    .attr('cx', center[0])
    .attr('cy', center[1])
    .attr('r', r)

var mask = svg.append('mask')
    .attr('id', 'edge');
mask.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'white');
mask.append('use')
    .attr('xlink:href', '#edgeCircle')
    .attr('fill', 'black');

d3.json('data/world-110m.json', function(error, world) {

    svg.append('path')
        .attr('class', 'land')
        .datum(topojson.feature(world, world.objects.land))
        .attr('d', geoPath);

    var moscow = [37.6173, 55.7558];
    var tokyo = [139.6917, 35.6895];
    var capeTown = [18.4241, -33.9249];

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    };

    var pointA = geoProjection.invert([width / 2, height / 2]);
    var pointB = geoProjection.invert([width / 2 + 1, height / 2 + 1]);
    var length = Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));

    var areaRadius = 25;
    svg.selectAll('polygon')
        .data([moscow, tokyo, capeTown])
        .enter()
        .append('polygon')
        .attr('class', 'area')
        .attr('points',function(point) { 
            return d3.range(0, 360, 10).map(function(d) {
                return geoProjection([
                    point[0] + Math.cos(toRadians(d)) * (length * areaRadius),
                    point[1] + Math.sin(toRadians(d)) * (length * areaRadius)
                ]);
            })
        }).attr('mask', function (d) {
            var longitude = Number(d[0]) + 180;

            var startLongitude = 360 - ((angle + 270) % 360);
            var endLongitude = (startLongitude + 180) % 360;

            if ((startLongitude < endLongitude && longitude > startLongitude && longitude < endLongitude) ||
                (startLongitude > endLongitude && (longitude > startLongitude || longitude < endLongitude))) {
                return null;
            } else {
                return "url(#edge)";
            }
        });

    svg.append('path')
      .datum({
        'type':'Feature',
        'properties':{},
        'geometry':{
            'type':'MultiLineString',
            'coordinates':[[moscow, tokyo], [moscow, capeTown], [tokyo, capeTown]]
        }
    }).style('fill', 'none')
    .style('stroke', 'green')
    .style('stroke-width', 1)
    .attr('d', geoPath);
});