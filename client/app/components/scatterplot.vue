<template>
  <div id='vueScatter' width="400px" height="400px">
    <div class="chartTitle"> GT/PT regression for selected Family</div>

    <div class="svg-container">

      <svg class="scatter-plot" id="scatterplotSvg" width="400px" height="400px">

        <!--<rect width="300" height="300"/>-->
        <g transform="translate(50, 50) " id="scatterplot">
          <g id="plot"></g>
          <path id="regression-line"/>
          <g id="x-axis" transform="translate(0, 300)"></g>
          <g id="yLeft-axis" transform="translate(0, 0)"></g>
          <g id="yRight-axis" transform="translate(0, 0)"></g>

        </g>
      </svg>
    </div>
  </div>
</template>

<script>

  import Sample from './../../js/sample.js'

  export default {
    name: 'vueScatter',
    data() {
      return {
        purple: "#8629EA",
        xScale: null,
        yScale: null,
        width: 300,
      }
    },

    props: {

      rawData: null,
      linePoints: null,
      opts: null,
      regressionType: null,
      operand: null,


    },

    methods: {

      buildPlot: function () {
        let self = this;

        console.log("change in raw data, inside buildPlot");

        let M = [];
        let F = [];
        for (let i = 0; i < self.rawData.length; i++) {
          if (self.rawData[i].sex === "M") {
            M.push(self.rawData[i]);
          } else if (self.rawData[i].sex === "F") {
            F.push(self.rawData[i]);
          }
        }
        let width = 300;
        let height = 300;
        // Set up the scales
        self.xScale = d3.scaleLinear()
          .domain([-0.2, 1.2])
          .range([0, width]);

        self.yScale = d3.scaleLinear()
          .domain([0, 12])
          .range([height, 0]);




        let svg = d3.select("#scatterplotSvg");
        let ticks = ["hom ref (0 AF)", "het(0.5 AF)", "hom alt (1 AF)"];
        let yLeftAxis = d3.select("#yLeft-axis");
        // let yRightAxis = d3.select("#yRight-axis")
        let xAxis = d3.select("#x-axis");
        xAxis.append("text")
          .attr("class", "axis-label")
          .attr("id", "xlabel")
        d3.select("#xlabel")
          .attr("transform", "translate(150, 37)")
          .text("Alternate Allele Frequency (GT)");


        d3.select("#ylabel")
          .attr("transform", "rotate(-90)")
          .attr("y", -50)
          .attr("x", -30)
          .text("PTC Sensitivity (PT)");

        yLeftAxis
          .call(d3.axisLeft(self.yScale))
          .attr("transform", "translate(0, 0 )");

        if(self.regressionType === "Logistic") {

        }
        else if (self.regressionType === "Linear"){

          console.log("self.linePoints", self.linePoints);

        }



        xAxis
          .call(d3.axisBottom(self.xScale).ticks(3).tickFormat(function (d, i) {
            return ticks[i];
          }))


        let squares = d3.select("#plot").selectAll('rect')
          .data(M).join("rect");
        squares
          .attr("x", d => self.xScale(d.xSource) - 10)
          .attr("y", d => self.yScale(d.ySource) - 10)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", d => d.color)
          .style("opacity", d => d.opacity)
          .on("click", d => console.log("(x,y): ", d.x, d.y));
        let squareText = d3.select("#plot").selectAll('text.sq')
          .data(M).join("text")
          .style("text-shadow", "2px 2px 11px white")
          .classed("sq", true);
        squareText
          .attr("x", d => self.xScale(d.xSource) - 10)
          .attr("y", d => self.yScale(d.ySource))
          .text(d => d.id);
        let circles = d3.select("#plot").selectAll('circle')
          .data(F).join("circle");
        circles
          .attr("cx", d => self.xScale(d.xSource))
          .attr("cy", d => self.yScale(d.ySource))
          .attr("r", 10)
          .style("fill", d => d.color)
          .style("opacity", d => d.opacity)
          .on("click", d => console.log("(x,y): ", d.x, d.y));
        let circleText = d3.select("#plot").selectAll('text.circ')
          .data(F).join("text")
          .style("text-shadow", "2px 2px 11px white")
          .classed("circ", true);
        circleText
          .attr("x", d => self.xScale(d.xSource) - 10)
          .attr("y", d => self.yScale(d.ySource))
          .text(d => d.id);

    },

      buildRegressionLine(){
        if(this.regressionType === "Linear") {
          let width = 300;
          let height = 300;
          let coords = [];
          for (let i = 0; i < this.linePoints[0].length; i++) {
            coords.push({x: this.linePoints[0][i], y: this.linePoints[1][i]})
          }
          var xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, width]);
          var yScale = d3.scaleLinear()
            .domain([0, 12])
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

    buildPTLegend() {

      let w = 200
      let h = 50;

      let key = d3.select("#legend")
        .append("svg")
        .attr("width", 220)
        .attr("height", 200);

      let legend = key.append("defs")
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
        .attr("stop-color", "#8629EA")
        .attr("stop-opacity", 1);

      key.append("rect")
        .attr("width", w + 1)
        .attr("height", h - 30)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,60)");

      let yScale = d3.scaleLinear()
        .range([w, 0])
        .domain([0, 12]);

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

  }
  ,
  mounted()
  {
    // this.buildPlot();
  }
  ,

  watch : {
    linePoints: function () {
      this.buildRegressionLine();
    },


    rawData: function () {

      this.buildPlot();
      // this.buildPTLegend();
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

  #regression-line {
    fill: black;
    stroke: #000000;
    stroke-width: 1;

  }


  .svg-container {
    display: inline-block;
    position: relative;
    vertical-align: top;
    overflow: hidden;
  }

  .svg-content-responsive {
    display: inline-block;
    position: absolute;
    top: 10px;
    left: 0;
  }

  .axis-label {

    fill: black;
    font-size: 14px;
    font-weight: bold;
  }

  #regression-line {
    fill: none;
  }


  .chartTitle {
    /*text-decoration: underline;*/
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: bold;
    margin-left: 20px;
  }

</style>
