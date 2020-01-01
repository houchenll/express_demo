export default function define(runtime, observer) {
    console.log("get const main");
    const main = runtime.module();

    // main.variable(observer("hello")).define("hello", ["md", "name"], function(md, name) {
    //     console.log("hello observer");
    //     return (md`# Hello ${name}`);
    // });
    // main.variable(observer("name")).define("name", function() {
    //     console.log("name observer");
    //     return ('world');
    // });

    main.variable(observer("dataset")).define("dataset", ["d3"], function(d3) {
        console.log("dataset observer");
        return(d3.csv('https://gist.githubusercontent.com/johnburnmurdoch/4199dbe55095c3e13de8d5b2e5e5307a/raw/fa018b25c24b7b5f47fd0568937ff6c04e384786/city_populations')
            )
    });
    main.variable(observer("height")).define("height", function() {
        console.log("height observer")
        return(600)
    });
    main.variable(observer("d3")).define("d3", ["require"], function(require) {
        console.log("d3 observer")
        return(
            require('d3-scale','d3-array','d3-fetch','d3-selection','d3-timer','d3-color','d3-format','d3-ease','d3-interpolate','d3-axis', 'd3-geo', 'd3-selection-multi')
            )
    });

    main.variable(observer("chart")).define("chart", ["d3", "DOM", "dataset", "width", "height"], function(d3, DOM, dataset, width, height) {
        console.log("chart observer");

        const svg = d3.select(DOM.svg(width, height));
        svg.style("background-color", "steelblue")
        console.log(svg);

        let title = svg.append('text')
            .attrs({
                class: 'title',
                y: 24
            })
            .html('The most populous cities in the world from 1500 to 2018');
        console.log(`title is ${title}`);

        return svg.node();
    });

    main.variable(observer()).define(["html"], function(html) {
        console.log("html observer");
        return(
            html`<style>
            text{
              font-size: 16px;
              font-family: Open Sans, sans-serif;
            }
            text.title{
              font-size: 28px;
              font-weight: 600;
            }
            text.subTitle{
              font-weight: 500;
              fill: #777777;
            }
            text.label{
              font-size: 18px;
            }
            .map-legend text{
              font-size: 14px;
              fill: #777777;
            }
            text.caption{
              font-weight: 400;
              font-size: 14px;
              fill: #999999;
            }
            text.yearText{
              font-size: 96px;
              font-weight: 700;
              fill: #cccccc;
            }
            text.yearIntro{
              font-size: 48px;
              font-weight: 700;
              fill: #cccccc;
            }
            .tick text {
              fill: #777777;
            }
            .xAxis .tick:nth-child(2) text {
              text-anchor: start;
            }
            .tick line {
              shape-rendering: CrispEdges;
              stroke: #dddddd;
            }
            .tick line.origin{
              stroke: #aaaaaa;
            }
            path.domain{
              display: none;
            }
            </style>`
            )
    });

    console.log("return main");
    return main;
}