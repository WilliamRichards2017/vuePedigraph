<template>
  <div id='vueScatter'>

    <svg class="scatter-plot" id="scatterplotSvg" width="350" height="350">
      <!--<rect width="300" height="300"/>-->
      <g transform="translate(50, 50) " id="scatterplot">
          <path id="regression-line"/>
        <g id="x-axis" transform="translate(0, 200)"></g>
        <g id="y-axis" transform="translate(0, 0)"></g>
      </g>
    </svg>

  </div>
</template>

<script>

export default {
  name: 'vueScatter',
  data() {
    return {

    }
  },

  props: {

    rawData: null,
    linePoints: null

  },
  methods: {
    buildTree: function () {

      let self = this;

      let data = [];

      let x = self.rawData[0];
      let y = self.rawData[1];

      for (let i = 0; i < x.length; i++){

        let d = {
          a : x[i],
          b : y[i]
        };
        data.push(d);
      }


      console.log("Data", data);

      let width = 200;
      let height = 200;


      // Set up the scales
      var xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=> d.a)])
        .range([ 0, width]);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=> d.b)])
        .range([height, 0]);

      let svg = d3.select("scatterplotSvg");

      // TO-DONE: Select and update the scatterplot


      console.log("d3", d3);


      let yAxis = d3.select("#y-axis");

      let xAxis = d3.select("#x-axis");


      xAxis
        .call(d3.axisBottom(xScale));

      yAxis
        .call(d3.axisLeft(yScale));

      d3.select("#scatterplot")
        .selectAll("circle")
        .data(data).join("circle")
        .attr("cx", d => xScale(d.a))
        .attr("cy", d => yScale(d.b))
        .attr("r", 4)
        .on("click", d => console.log("(x,y): ", d.a, d.b))
        .select("title")
        .text(d => d.a.toString() + ", " + d.b.toString());


    },

    buildRegressionLine(){
      console.log("this.linePoints inside regression", this.linePoints);


      let coords = [];

      for(let i = 0; i < this.linePoints[0].length; i++){
        coords.push({x: this.linePoints[0][i], y: this.linePoints[1][i]})
      }


      var xScale = d3.scaleLinear()
        .domain([0, d3.max(coords, d=> d.x)])
        .range([ 0, 200]);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(coords, d=> d.y)])
        .range([200, 0]);

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
    this.buildTree();
    this.buildRegressionLine();
  },

  watch : {
    linePoints: function () {
      this.buildTree();
      this.buildRegressionLine();
    }
  }
}
</script>


<style>
  /* style of scatter plot */
  .scatter-plot circle {
    fill: #c7001e;
  }

  /* style of scatter plot frame */
  .scatter-plot rect {
    fill: none;
    stroke: #000000;
    stroke-width: 1;
  }

  #regression-line{
    fill: black;
    stroke: #000000;
    stroke-width: 1;

  }
</style>
