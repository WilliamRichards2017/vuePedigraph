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
    </div>
  </div>
</template>

<script>

  import Sample from './../../js/sample.js'

  export default {
    name: 'vueScatter',
    data() {
      return {
        purple: "#8629EA"
      }
    },

    props: {

      rawData: null,
      linePoints: null,
      opts: null,
      regressionType: null,
      operand: null,
      cuttoff: null,


    },

    methods: {

      getColor: function (d) {
        let self = this;

        if (self.regressionType === "Linear") {

          let color = d3.interpolateRgb("white", "#8629EA")(1 - (d.ySource / 12));
          return color;
          // console.log("typeof sens", typeof sens);
        } else if (self.regressionType === "Logistic") {

          let color = "white";
          self.operand == parseInt(self.cuttoff);

          let sens = d.ySource;

          if (self.operand === "<") {
            if (sens < self.cuttoff) {
              color = self.purple;
            }
          } else if (self.operand === ">") {
            if (sens > self.cuttoff) {
              color = self.purple;
            }
          } else if (self.operand === ">=") {
            if (sens >= self.cuttoff) {
              color = self.purple;

            }
          } else if (self.operand === "<=") {
            if (sens <= self.cuttoff) {
              color = self.purple;

            }
          }
          return color;
        }
        return "None";
      },

      buildPlot: function () {
        let self = this;
        let data = [];
        let x = self.rawData[0];
        let y = self.rawData[1];
        let ids = self.rawData[2];
        let sexes = self.rawData[3];
        let xSource = self.rawData[5];
        let ySource = self.rawData[6];
        for (let i = 0; i < xSource.length; i++) {
          let d = {
            x: x[i],
            y: y[i],
            id: ids[i],
            sex: sexes[i],
            xSource: xSource[i],
            ySource: ySource[i],
          };
          data.push(d);
        }
        let M = [];
        let F = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].sex === "M") {
            M.push(data[i]);
          } else if (data[i].sex === "F") {
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
          .domain([0, d3.max(data, d => d.y)])
          .range([height, 0]);
        let svg = d3.select("#scatterplotSvg");
        let ticks = ["hom ref (0 AF)", "hom alt (0.5 AF)", "hom alt (1 AF)"];
        let yAxis = d3.select("#y-axis");
        let xAxis = d3.select("#x-axis");
        xAxis.append("text")
          .attr("class", "axis-label")
          .attr("id", "xlabel");
        d3.select("#xlabel")
          .attr("transform", "translate(150, 37)")
          .text("Alternate Allele Frequency (GT)");


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
          .call(d3.axisBottom(xScale).ticks(3).tickFormat(function (d, i) {
            return ticks[i];
          }));


        let squares = d3.select("#plot").selectAll('rect')
          .data(M).join("rect");
        squares
          .attr("x", d => xScale(d.xSource) - 10)
          .attr("y", d => yScale(d.ySource) - 10)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", d => {
            return self.getColor(d)
          })
          .on("click", d => console.log("(x,y): ", d.x, d.y));
        let squareText = d3.select("#plot").selectAll('text.sq')
          .data(M).join("text")
          .style("text-shadow", "2px 2px 11px white")
          .classed("sq", true);
        squareText
          .attr("x", d => xScale(d.xSource) - 10)
          .attr("y", d => yScale(d.ySource))
          .text(d => d.id);
        let circles = d3.select("#plot").selectAll('circle')
          .data(F).join("circle");
        circles
          .attr("cx", d => xScale(d.xSource))
          .attr("cy", d => yScale(d.ySource))
          .attr("r", 10)
          .style("fill", d => {
            return self.getColor(d)
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


      buildRegressionLine() {
        let width = 300;
        let height = 300;

        let coords = [];

        if (this.regressionType === "Logistic") {

          console.log("logistic")

          coords = [{x: 0, y: 6.5}, {x: 0, y: 6.5}, {x: 0, y: 6.5}, {x: 0.5, y: 6.5}, {x: 0.5, y: 6.5}, {x: 0.5, y: 6.5}, {x: 0.5, y: 6.5}, {x: 0.5, y: 6.5}, {x: 0.5, y: 6.5}, {x: 0.5, y: 6.5}];

          let xScale = d3.scaleLinear()
            .domain([0, 0.5])
            .range([0, width]);

          let yScale = d3.scaleLinear()
            .domain([0, 10])
            .range([height, 0]);

          let aLineGenerator = d3
            .line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

          d3.select("#regression-line")
            .attr("d", aLineGenerator(coords))
            .attr("transform");

        } else if(this.regressionType === "Linear") {
          let coords = [];
          for (let i = 0; i < this.linePoints[0].length; i++) {
            coords.push({x: this.linePoints[0][i], y: this.linePoints[1][i]});
          }

          console.log("coords lin", coords);

          let xScale = d3.scaleLinear()
            .domain([0, d3.max(coords, d => d.x)])
            .range([0, width]);

          let yScale = d3.scaleLinear()
            .domain([0, d3.max(coords, d => d.y)])
            .range([height, 0]);

          let aLineGenerator = d3
            .line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

          d3.select("#regression-line")
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

  }
  ,
  mounted()
  {
    // this.buildPlot();
    // this.buildRegressionLine();
  }
  ,

  watch : {
    linePoints: function () {
      // this.buildPlot();
      // this.buildRegressionLine();
      setTimeout(this.buildRegressionLine(), 1000);

    }
  ,
    rawData: function () {

      this.buildPlot();
      // this.buildPTLegend();
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

  #regression-line {
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
