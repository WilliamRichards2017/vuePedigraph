<template>
  <div id='vueScatter'>

    <svg class="scatter-plot" id="scatterplotSvg" width="350" height="350">
      <!--<rect width="300" height="300"/>-->
      <g transform="translate(50, 50) " id="scatterplot">
        <g class="line-chart">
          <line id="regression-line" x1="2" y1="4" x2="16" y2="11"/>
        </g>
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

    rawData: null

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


      d3.select("#regression-line")
        .attr("x1", xScale(2))
        .attr("y1", yScale(4))
        .attr("x2", xScale(16))
        .attr("y2", yScale(11));
    }
  },
  mounted() {
    this.buildTree();
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
</style>
