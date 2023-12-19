const eleventySass = require('@11tyrocks/eleventy-plugin-sass-lightningcss');
const esbuild = require('esbuild');
const markdownIt = require("markdown-it");
const nunjucks = require('nunjucks');
const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = (eleventyConfig) => {
  // Templating
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  // eleventyConfig.setLibrary('md', markdownIt(options));
  // Fonts
  eleventyConfig.addPassthroughCopy('src/fonts');
  // Styles
  eleventyConfig.addPlugin(eleventySass);
  // Scripts
  eleventyConfig.addTemplateFormats('js');
  eleventyConfig.addExtension('js', {
      outputFileExtension: 'js',
      compile: async (content, path) => {
          if ( path !== './src/scripts/main.js' ) {
              return;
          }
          return async () => {
              let output = await esbuild.build({
                  target: 'es2020',
                  entryPoints: [path],
                  minify: true,
                  bundle: true,
                  write: false,
              });

              return output.outputFiles[0].text;
          }
      }
  });

  eleventyConfig.addFilter('makeList', function(value, delimiter = ',') {
    const newValue = value.split(',');
    return newValue;
  });
      
  return {
    dir: {
      output: "public",
      input: "src"
    },
  };

};
