function define(runtime, observer) {
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

    console.log("return main");
    return main;
}