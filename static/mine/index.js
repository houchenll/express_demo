export default function define(runtime, observer) {
    console.log("get const main");
    const main = runtime.module();

    main.variable(observer("hello")).define("hello", ["md", "name"], function(md, name) {
        console.log("hello observer");
        return (md`# Hello ${name}`);
    });
    main.variable(observer("name")).define("name", function() {
        console.log("name observer");
        return ('world');
    });

    main.variable(observer("dataset")).define("dataset", ["d3"], function(d3) {
        console.log("dataset observer");
        return(d3.csv('https://gist.githubusercontent.com/johnburnmurdoch/4199dbe55095c3e13de8d5b2e5e5307a/raw/fa018b25c24b7b5f47fd0568937ff6c04e384786/city_populations'))
    });

    console.log("return main");
    return main;
}