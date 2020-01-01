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
    main.variable(observer("tickDuration")).define("tickDuration", function() {
        console.log("tickDuration observer")
        return(250)
    });

    main.variable(observer("chart")).define("chart", ["d3", "DOM", "dataset", "width", "height", "tickDuration"], function(d3, DOM, dataset, width, height, tickDuration) {
        console.log("chart observer");

        const svg = d3.select(DOM.svg(width, height));
        svg.style("background-color", "#DDEEFF")
        console.log(svg);

        let title = svg.append('text')
            .attrs({
                class: 'title',
                y: 24
            })
            .html('The most populous cities in the world from 1500 to 2018');
        console.log(`title is ${title}`);

        let year = 1500;    // start year
        let top_n = 10;
        const margin = {
            top: 80,
            right: 0,
            bottom: 5,
            left: 0
        };
        let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

        dataset.forEach(d => {
            d.value = +d.value,
            d.lastValue = +d.lastValue,
            d.value = isNaN(d.value) ? 0 : d.value,
            d.year = +d.year,
            // d.colour = d3.hsl(Math.random()*360,0.75,0.75)
            d.colour = "#C8BDFF"
        });

        let yearSlice = dataset.filter(d => d.year == year && !isNaN(d.value))
            .sort((a,b) => b.value - a.value)
            .slice(0,top_n);

        yearSlice.forEach((d,i) => d.rank = i);

        let x = d3.scaleLinear()
            .domain([0, d3.max(yearSlice, d => d.value)])
            .range([margin.left, width-margin.right-65]);

        let y = d3.scaleLinear()
            .domain([top_n, 0])
            .range([height-margin.bottom, margin.top]);

        let colourScale = d3.scaleOrdinal()
            .range(["#adb0ff", "#ffb3ff", "#90d595", "#e48381", "#aafbff", "#f7bb5f", "#eafb50"])
            .domain(["India","Europe","Asia","Latin America","Middle East","North America","Africa"]);

        // timeout的参数是一个延迟(6000ms)执行的方法，只执行一次
        // _ 表示什么？为什么用 _
        d3.timeout(_ => {
            console.log('timeout');

            // interval的参数是一个每隔tickDuration ms就执行一次的方法
            // e 为从方法被调用到现在的时间总长度
            let ticker = d3.interval(e => {
                console.log('year', year, e, tickDuration);

                yearSlice = dataset.filter(d => d.year == year && !isNaN(d.value))
                    .sort((a,b) => b.value - a.value)
                    .slice(0,top_n);

                yearSlice.forEach((d,i) => d.rank = i);

                let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);

                bars.enter()
                    .append('rect')
                    .attrs({
                        class: d => `bar ${d.name.replace(/\s/g,'_')}`,
                        x: x(0)+1,
                        width: d => x(d.value)-x(0)-1,
                        y: d => y(top_n+1)+5,
                        height: y(1)-y(0)-barPadding
                    })
                    .styles({
                        fill: d => colourScale(d.group)
                    })
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attr({
                        y: d => y(d.rank) + 5
                    });

                if(year == 2018) ticker.stop();    // 2018 == endYear
                year = year + 1;
            }, tickDuration);

        }, 6000);

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