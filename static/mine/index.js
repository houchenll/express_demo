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

        let xAxis = d3.axisTop()
            .scale(x)
            .ticks(width > 500 ? 5:2)
            .tickSize(-(height-margin.top-margin.bottom))
            .tickFormat(d => d3.format(',')(d));

        svg.append('g')
            .attrs({
              class: 'axis xAxis',
              transform: `translate(0, ${margin.top})`
            })
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);

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

                x.domain([0, d3.max(yearSlice, d => d.value)]);

                svg.select('.xAxis')
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .call(xAxis);

                let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);

                // bar 从表格外加入表格，初始显示在表格外，使用动画显示到它应显示的位置
                // ease 后的attr 表格希望动画后rect的属性
                bars.enter()
                    .append('rect')
                    .attrs({
                        // 空格换为下划线
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

                // 表格中已存在的bar，在数据变化后，变更它的width和y，使用动画移动它的位置
                bars
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        width: d => x(d.value)-x(0)-1,
                        y: d => y(d.rank)+5
                    });

                // 因数据变化，需要移出表格的bar，指定它需要变化到的width和y，然后使用动画移动
                bars
                    .exit()
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        width: d => x(d.value)-x(0)-1,
                        y: d => y(top_n+1)+5
                    })
                    .remove();


                let labels = svg.selectAll('.label').data(yearSlice, d => d.name);

                labels
                    .enter()
                    .append('text')
                    .attrs({
                        class: 'label',
                        transform: d => `translate(${x(d.value)-5}, ${y(top_n+1)+5+((y(1)-y(0))/2)-8})`,
                        'text-anchor': 'end'
                    })
                    .html('')
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        transform: d => `translate(${x(d.value)-5}, ${y(d.rank)+5+((y(1)-y(0))/2)-8})`
                    });

                let tspans = labels.selectAll('tspan')
                    .data(d => [{text: d.name, opacity: 1, weight:600}, {text: d.subGroup, opacity: 1, weight:400}]);

                tspans.enter()
                    .append('tspan')
                    .html(d => d.text)
                    .attrs({
                        x: 0,
                        dy: (d,i) => i*16
                    })
                    .styles({
                        // opacity: d => d.opacity,
                        fill: d => d.weight == 400 ? '#444444':'',
                        'font-weight': d => d.weight,
                        'font-size': d => d.weight == 400 ? '12px':''
                    });

                tspans
                    .html(d => d.text)
                    .attrs({
                        x: 0,
                        dy: (d,i) => i*16
                    })
                    .styles({
                        // opacity: d => d.opacity,
                        fill: d => d.weight == 400 ? '#444444':'',
                        'font-weight': d => d.weight,
                        'font-size': d => d.weight == 400 ? '12px':''
                    });

                tspans.exit().remove();

                labels
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        transform: d => `translate(${x(d.value)-5}, ${y(d.rank)+5+((y(1)-y(0))/2)-8})`
                    });

                labels
                    .exit()
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        transform: d => `translate(${x(d.value)-8}, ${y(top_n+1)+5})`
                    })
                    .remove();

                let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);

                valueLabels
                    .enter()
                    .append('text')
                    .attrs({
                      class: 'valueLabel',
                      x: d => x(d.value)+5,
                      y: d => y(top_n+1)+5,
                    })
                    .text(d => d3.format(',.0f')(d.lastValue))
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        y: d => y(d.rank)+5+((y(1)-y(0))/2)+1
                    });

                valueLabels
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        x: d => x(d.value)+5,
                        y: d => y(d.rank)+5+((y(1)-y(0))/2)+1
                    })
                    .tween("text", function(d) {
                        let i = d3.interpolateRound(d.lastValue, d.value);
                        return function(t) {
                            this.textContent = d3.format(',')(i(t));
                        };
                    });

                valueLabels
                    .exit()
                    .transition()
                    .duration(tickDuration)
                    .ease(d3.easeLinear)
                    .attrs({
                        x: d => x(d.value)+5,
                        y: d => y(top_n+1)+5
                    })
                    .remove();





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