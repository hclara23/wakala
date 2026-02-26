module.exports = function (eleventyConfig) {
    // Copy static assets to the output folder
    eleventyConfig.addPassthroughCopy("src/style.css");
    eleventyConfig.addPassthroughCopy("src/script.js");
    eleventyConfig.addPassthroughCopy("src/admin");

    // Also pass through any images that might be in the root or src
    eleventyConfig.addPassthroughCopy("src/**/*.jpg");
    eleventyConfig.addPassthroughCopy("src/**/*.png");

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
};
