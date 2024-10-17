import * as d3 from 'd3'

console.log('Hello World')

const data = [30, 86, 168, 234, 12, 67];

d3.select("body")
  .selectAll("div")
  .data(data)
  .enter()
  .append("div")
  .style("width", (d) => d + "px")
  .style("background", "teal")
  .style("color", "red")