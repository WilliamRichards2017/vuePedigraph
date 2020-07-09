<template>
  <div id='vueScatter' width="400px" height="400px" style="background-color: #f2f2f2; border-color: black; border-style: solid; border-width: 1px" >
    <div class="chartTitle"> GT/PT regression for selected Family</div>

    <div class="svg-container">

      <svg class="scatter-plot" id="scatterplotSvg" width="400px" height="400px">
        <rect width="300px" height="300px" style="fill: white" transform="translate(75, 30)"></rect>

        <!--<rect width="300" height="300"/>-->
        <g transform="translate(75, 30) " id="scatterplot">
          <g id="plot"></g>
          <path id="regression-line"/>
          <g id="x-axis" transform="translate(0, 300)" style="font-size: 12px; font-weight: bold"></g>
          <g id="yLeft-axis" transform="translate(0, 0)" style="font-size: 12px; font-weight: bold"></g>

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
        purple: "#3D6FFF",
        xScale: null,
        yScale: null,
        width: 300,
        height: 300
      }
    },

    props: {
      binaryType: null,
      noVariants: null,
      rawData: null,
      linePoints: null,
      opts: null,
      regressionType: null,
      operand: null,
      maxPt: null,
      minPt: null,


    },

    methods: {

      nFormatter(num) {

        let digits = 2
        var si = [
          {value: 1, symbol: ""},
          {value: 1E3, symbol: "K"},
          {value: 1E6, symbol: "M"},
          {value: 1E9, symbol: "B"},
          {value: 1E12, symbol: "T"}
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
          if (num >= si[i].value) {
            break;
          }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
      },

      nFormatterLabel(num) {

        let digits = 2;
        if(this.binaryType === "Yes"){
          if(num == 1){
            return "Yes"
          }
          return "No";
        }


        var si = [
          {value: 1, symbol: ""},
          {value: 1E3, symbol: "K"},
          {value: 1E6, symbol: "M"},
          {value: 1E9, symbol: "B"},
          {value: 1E12, symbol: "T"}
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
          if (num >= si[i].value) {
            break;
          }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
      },

      buildPlot: function () {
        let self = this;

        var tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")

        let M = [];
        let F = [];
        for (let i = 0; i < self.rawData.length; i++) {
          if (self.rawData[i].sex === "M") {
            M.push(self.rawData[i]);
          } else if (self.rawData[i].sex === "F") {
            F.push(self.rawData[i]);
          }
        }

        // Set up the scales
        self.xScale = d3.scaleLinear()
          .domain([-0.2, 1.2])
          .range([0, self.width]);

        self.yScale = d3.scaleLinear()
          .domain([self.minPt, self.maxPt])
          .range([self.height, 0]);

        let svg = d3.select("#scatterplotSvg");
        let ticks = ["0 AF", "0.5 AF", "1 AF"];
        // let yRightAxis = d3.select("#yRight-axis")
        let xAxis = d3.select("#x-axis");


        if(!this.noVariants) {
          xAxis.append("text")
            .attr("class", "axis-label")
            .attr("id", "xlabel")
            .attr("transform", "translate(150, 37)")
            .text("Alternate Allele Frequency (GT)");
        }
        else{
          xAxis.append("text")
            .attr("class", "axis-label")
            .attr("id", "xlabel")
            .attr("transform", "translate(100, 37)")
            .text("Genotype N/A");
        }


        d3.select("#ylabel")
          .text("PTC Sensitivity (PT)")

        let yLeftAxis = d3.select("#yLeft-axis");

        let tickNum = 5;

        if(self.binaryType && self.binaryType !== "Number" && self.binaryType !== "unknown"){
          tickNum = 1;
        }


        yLeftAxis
          .call(d3.axisLeft(self.yScale)
          .ticks(tickNum)
          .tickFormat(d => self.nFormatterLabel(d)));


        let blue = " #e6e6e6";
        let red = "#595959";


        if(!this.noVariants) {
          xAxis
            .call(d3.axisBottom(self.xScale).ticks(3).tickFormat(function (d, i) {
              return ticks[i];
            }));


          xAxis.append('svg').append("rect").attr("width", "5px").attr('height', "13px")
            .attr("x", 172)
            .attr("y", 5)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("fill", blue);

          xAxis.append("rect").attr("width", "5px").attr('height', "13px")
            .attr("x", 182)
            .attr("y", 5)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("fill", red);



          xAxis.append('svg').append("rect").attr("width", "5px").attr('height', "13px")
            .attr("x", 277)
            .attr("y", 5)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("fill", red);

          xAxis.append("rect").attr("width", "5px").attr('height', "13px")
            .attr("x", 287)
            .attr("y", 5)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("fill", red);

          xAxis.append('svg').append("rect").attr("width", "5px").attr('height', "13px")
            .attr("x", 62)
            .attr("y", 5)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("fill", blue);

          xAxis.append("rect").attr("width", "5px").attr('height', "13px")
            .attr("x", 73)
            .attr("y", 5)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("fill", blue);

        }

        let highlightCircle = function(d) {
          d3.select(this).attr("r", 15);

          // tooltip.style("visibility", "visible").text(d.id)
          //   .style("font-size", 12)
          //   .style("font-weight", "bold");

        };


        let highlightSquare = function(d) {

          d3.select(this).attr("width", 30)
            .attr("height", 30)
            .attr("x", self.xScale(d.xSource) - 15)
            .attr("y", self.yScale(d.ySource) - 15);

          // tooltip.style("visibility", "visible").text(d.id)
          //   .style("font-size", 12)
          //   .style("font-weight", "bold");

        };

        let unhighlightCircle = function() {

          tooltip.style("visibility", "hidden");

          d3.select(this).attr("r", 10);

        };

        let unhighlightSquare = function(d) {

          tooltip.style("visibility", "hidden");

          d3.select(this).attr("width", 20)
            .attr("height", 20)
            .attr("x", self.xScale(d.xSource) - 10)
            .attr("y", self.yScale(d.ySource) - 10);
        };



        let squares = d3.select("#plot").selectAll('rect')
          .data(M).join("rect");
        squares
          .attr("x", d => self.xScale(d.xSource) - 10)
          .attr("y", d => self.yScale(d.ySource) - 10)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", d => d.color)
          .style("opacity", d => d.opacity)
          .on("mouseover", highlightSquare)
          .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX + 5)+"px");})
          .on("mouseout", unhighlightSquare)

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
          .on("mouseover", highlightCircle)
          .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX + 5)+"px");})
          .on("mouseout", unhighlightCircle);


        let circleText = d3.select("#plot").selectAll('text.circ')
          .data(F).join("text")
          .style("text-shadow", "2px 2px 11px white")
          .classed("circ", true);
        circleText
          .attr("x", d => self.xScale(d.xSource) -10)
          .attr("y", d => self.yScale(d.ySource))
          .text(d => d.id);

      },

      buildRegressionLine(){

        let self = this;

          let coords = [];

          if(this.linePoints === null) {
            this.linePoints = [[0,0], [0,0]];
          }
          else {
            for (let i = 0; i < this.linePoints[0].length; i++) {
              coords.push({x: this.linePoints[0][i], y: this.linePoints[1][i]})
            }
          }

          var xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, self.width]);

          var yScale = d3.scaleLinear()
            .domain([this.minPt, this.maxPt])
            .range([self.height, 0]);
          let aLineGenerator = d3
            .line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));


          d3.select("#regression-line")
            .data(this.linePoints)
            .attr("d", aLineGenerator(coords))
            .attr("transform");

      },

    buildPTLegend() {

      let w = 200;
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
        .domain([this.minPt, this.maxPt]);

      var yAxis = d3.axisBottom()
        .scale(yScale)




      key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,80)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")
        .style("text-anchor", "end");

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

      if(this.binaryType !== "Number"){
        this.minPt = 0;
        this.maxPt = 1;
      }

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

  .scatter-plot text.sq {
    font-size: 8px;
    font-weight: bold;
  }

  .scatter-plot text.circ {
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


  .tooltip {
    position: absolute;
    text-align: center;
    width: 60px;
    height: 28px;
    padding: 2px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
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
    padding-top: 20px;
  }

</style>
