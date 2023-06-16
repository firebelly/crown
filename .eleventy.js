const eleventySass = require('@11tyrocks/eleventy-plugin-sass-lightningcss');
const esbuild = require('esbuild');

module.exports = (eleventyConfig) => {
    // Fonts
    eleventyConfig.addPassthroughCopy('src/fonts');
    // Styles
    eleventyConfig.addPlugin(eleventySass);
    // Scripts
    eleventyConfig.addTemplateFormats('js');
    eleventyConfig.addExtension('js', {
        outputFileExtension: 'js',
        compile: async (content, path) => {
            if (path !== './src/scripts/main.js') {
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

    return {
      dir: {
        output: "public",
        input: "src"
      },
    };
  
};
