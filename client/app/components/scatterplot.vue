<template>
  <div id='vueScatter'>
  <div class="chartTitle"> GT/PT regression for selected Family</div>

  <div class="svg-container">

    <svg class="scatter-plot" id="scatterplotSvg" width="400px" height="400px">

      <!--<rect width="300" height="300"/>-->
      <g transform="translate(50, 50) " id="scatterplot">
        <g id="plot"></g>
          <path id="regression-line"/>
        <g id="x-axis" transform="translate(0, 300)"></g>
        <g id="y-axis" transform="translate(0, 0)"></g>
      </g>
    </svg>

    <div id="legend"></div>

  </div>
  </div>
</template>

<script>

import Sample from './../../js/sample.js'

export default {
  name: 'vueScatter',
  data() {
    return {

    }
  },

  props: {

    rawData: null,
    linePoints: null,
    opts: null,


  },

  methods: {
    buildPlot: function () {

      let self = this;


      let data = [];

      console.log("self.linePoints", self.linePoints);

      console.log("self.rawData", self.rawData);

      let x = self.rawData[0];
      let y = self.rawData[1];
      let ids = self.rawData[2];
      let sexes = self.rawData[3];
      let colors = self.rawData[4];
      let xSource = self.rawData[5];
      let ySource = self.rawData[6];

      console.log("ids", ids);
      console.log("xSource in scatter plot", xSource);
      console.log("ySource in scatter plot", ySource);




      for (let i = 0; i < xSource.length; i++){

        let d = {
          x : x[i],
          y : y[i],
          id : ids[i],
          sex: sexes[i],
          color: colors[i],
          xSource : xSource[i],
          ySource: ySource[i],

        };
        data.push(d);
      }

      let M = [];
      let F = [];

      for(let i = 0; i < data.length; i++){

        if(data[i].sex === "M"){
          M.push(data[i]);
        }
        else if(data[i].sex === "F"){
          F.push(data[i]);
        }
      }



      let width = 300;
      let height = 300;


      // Set up the scales
      var xScale = d3.scaleLinear()
        .domain([-0.2, 1.2])
        .range([0, width]);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=> d.y)])
        .range([height, 0]);

      let svg = d3.select("#scatterplotSvg");


      let ticks=["hom ref (0 AF)", "hom alt (0.5 AF)", "hom alt (1 AF)"];


      // TO-DONE: Select and update the scatterplot



      let yAxis = d3.select("#y-axis");

      let xAxis = d3.select("#x-axis");


      xAxis.append("text")
        .attr("class", "axis-label")
        .attr("id", "xlabel");

      d3.select("#xlabel")
        .attr("transform", "translate(150, 37)")
        .text("Alternate Allele Frequency (GT)");


      xAxis
        .call(d3.axisBottom(xScale).ticks(3).tickFormat(function (d, i) {
          return ticks[i];
        })
    );


      yAxis.append("text")
        .attr("class", "axis-label")
        .attr("id", "ylabel");


      d3.select("#ylabel")
        .attr("transform", "rotate(-90)")
        .attr("y", -27)
        .attr("x", -100)
        .text("PTC Sensitivity (PT)");

      yAxis
        .call(d3.axisLeft(yScale));



      xAxis
        .call(d3.axisBottom(xScale));


      let squares = d3.select("#plot").selectAll('rect')
        .data(M).join("rect");

      squares
        .attr("x", d => xScale(d.xSource) -10)
        .attr("y", d => yScale(d.ySource) - 10)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d =>  {
          let color = d3.interpolateRgb("white", "#8629EA")(1-(d.ySource/12));
          console.log("d", d);
          return color;
        })

        .on("click", d => console.log("(x,y): ", d.x, d.y));


      let squareText = d3.select("#plot").selectAll('text.sq')
        .data(M).join("text")
        .style("text-shadow", "2px 2px 11px white")
        .classed("sq", true);

      squareText
        .attr("x", d =>  xScale(d.xSource) - 10)
        .attr("y", d => yScale(d.ySource))
        .text(d => d.id);


      let circles = d3.select("#plot").selectAll('circle')
        .data(F).join("circle");

      circles
        .attr("cx", d => xScale(d.xSource))
        .attr("cy", d => yScale(d.ySource))
        .attr("r", 10)
        .style("fill", d =>  {
          let color = d3.interpolateRgb("white", "#8629EA")(1-(d.ySource/12));
          console.log("d", d);
          return color;
        })
        .on("click", d => console.log("(x,y): ", d.x, d.y));

      let circleText = d3.select("#plot").selectAll('text.circ')
        .data(F).join("text")
        .style("text-shadow", "2px 2px 11px white")
        .classed("circ", true);

      circleText
        .attr("x", d => xScale(d.xSource) - 10)
        .attr("y", d => yScale(d.ySource))
        .text(d => d.id);





    },


    buildRegressionLine(){


      let width = 300;
      let height = 300;


      let coords = [];

      for(let i = 0; i < this.linePoints[0].length; i++){
        coords.push({x: this.linePoints[0][i], y: this.linePoints[1][i]})
      }


      var xScale = d3.scaleLinear()
        .domain([0, d3.max(coords, d=> d.x)])
        .range([ 0, width]);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(coords, d=> d.y)])
        .range([height, 0]);

      let aLineGenerator = d3
        .line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

      d3.select("#regression-line")
        .data(this.linePoints)
        .attr("d", aLineGenerator(coords))
        .attr("transform");


    },

    buildPTLegend(){
      var w = 200, h = 50;

      var key = d3.select("#legend")
        .append("svg")
        .attr("width", 220)
        .attr("height", 200);

      var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#F9F9F9")
        .attr("stop-opacity", 1);


      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#5810A5")
        .attr("stop-opacity", 1);

      key.append("rect")
        .attr("width", w+1)
        .attr("height", h - 30)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,60)");

      let yScale = d3.scaleLinear()
        .range([w, 0])
        .domain([12, 0]);

      var yAxis = d3.axisBottom()
        .scale(yScale)
        .ticks(5);

      key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,80)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")
        .style("text-anchor", "end")

      key.append("text")
        .attr("transform", "translate(0,50)")
        .text("less affected <----> more affected");


    },

  },
  mounted() {
    this.buildPTLegend
    // this.buildPlot();
    // this.buildRegressionLine();
  },

  watch : {
    linePoints: function () {
      // this.buildPlot();
      // this.buildRegressionLine();
    },
    rawData: function(){
      this.buildPlot();
      setTimeout(this.buildRegressionLine(), 1000);
    }
  }
}
</script>


<style>
  .scatter-plot circle {

     stroke: #000000;
     stroke-width: 1;

  }

  .scatter-plot text {
    font-size: 8px;
    font-weight: bold;

  }

  /* style of scatter plot frame */
  .scatter-plot rect {
    stroke: #000000;
    stroke-width: 1;
  }

  #regression-line{
    fill: black;
    stroke: #000000;
    stroke-width: 1;

  }


  .svg-container {
    display: inline-block;
    position: relative;
    padding-bottom: 100%; /* aspect ratio */
    vertical-align: top;
    overflow: hidden;
  }
  .svg-content-responsive {
    display: inline-block;
    position: absolute;
    top: 10px;
    left: 0;
  }

  .axis-label{

    fill: black;
    font-size: 14px;
    font-weight: bold;
  }

  #regression-line {
    fill: none;
  }



  .chartTitle{
    /*text-decoration: underline;*/
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: bold;
    margin-left: 20px;
  }

</style>
