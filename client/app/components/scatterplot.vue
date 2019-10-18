<template>
  <div id='vueScatter'>
<v-card width="400px" height="420px">

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
  </div>
</v-card>
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
    opts: null

  },

  methods: {
    buildPlot: function () {

      let self = this;

      console.log("self.opts.dataset inside scatterplot", self.opts.dataset);

      let data = [];

      let x = self.rawData[0];
      let y = self.rawData[1];
      let ids = self.rawData[2];
      let sexes = self.rawData[3];
      let colors = self.rawData[4];


      console.log("lengths", x.length, ids.length, sexes.length);

      for (let i = 0; i < x.length; i++){

        let d = {
          x : x[i],
          y : y[i],
          id : ids[i],
          sex: sexes[i],
          color: colors[i]
        };
        data.push(d);
      }

      let M = [];
      let F = [];

      for(let i = 0; i < data.length; i++){
        console.log("data.sex", data[i].sex);

        if(data[i].sex === "M"){
          M.push(data[i]);
        }
        else if(data[i].sex === "F"){
          F.push(data[i]);
        }
      }


      console.log("Data", data);

      let width = 300;
      let height = 300;


      // Set up the scales
      var xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=> d.x)])
        .range([0, width]);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=> d.y)])
        .range([height, 0]);

      let svg = d3.select("#scatterplotSvg");

      // TO-DONE: Select and update the scatterplot


      console.log("d3", d3);


      let yAxis = d3.select("#y-axis");

      let xAxis = d3.select("#x-axis");


      xAxis.append("text")
        .attr("class", "axis-label")
        .attr("id", "xlabel");

      d3.select("#xlabel")
        .attr("transform", "translate(150, 37)")
        .text("Alternate Allele Frequency (GT)");


      xAxis
        .call(d3.axisBottom(xScale));


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

      let circles = d3.select("#plot").selectAll('circles')
        .data(F).join("circle");

      let circleText = d3.select("#plot").selectAll('text')
        .data(F).join("text");

      circleText
        .attr("x", d => {console.log(xScale(d.x)); return xScale(d.x) - 10})
        .attr("y", d => yScale(d.y))
        .text(d => d.id);

      let squareText = d3.select("#plot").selectAll('rect')
        .data(M).join("text");

      squareText
        .attr("x", d => {console.log(xScale(d.x)); return xScale(d.x) - 10})
        .attr("y", d => yScale(d.y))
        .text(d => d.id);

     circles
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 10)
       .style("fill", d => {console.log("d.color", d.color); return d.color })
        .on("click", d => console.log("(x,y): ", d.x, d.y))
       .enter().append("text")
       .text(d => d.name);

      let squares = d3.select("#scatterplot").selectAll('rect')
        .data(M).join("rect");

      squares
        .attr("x", d => xScale(d.x) -10)
        .attr("y", d => yScale(d.y) - 10)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d => d.color)

        .on("click", d => console.log("(x,y): ", d.x, d.y));





    },


    buildRegressionLine(){


      let width = 300;
      let height = 300;

      console.log("this.linePoints inside regression", this.linePoints);


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


    }
  },
  mounted() {
    this.buildPlot();
    this.buildRegressionLine();
  },

  watch : {
    linePoints: function () {
      this.buildPlot();
      this.buildRegressionLine();
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
    margin-top:5px;
    margin-left: 20px;
  }

</style>
