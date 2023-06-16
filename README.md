# Crown

## About

TODO: blurb about Crown project

https://mycrownschool.uchicago.edu/field/

## Requirements :computer:

This static site is generated using [Eleventy](https://www.11ty.dev/).

### Styles, Scripts and Assets

See the `.eleventy.js` config file for more details on asset handling.

- To compile stylesheets we use the Eleventy Plugin, [Sass Lightning CSS](https://github.com/5t3ph/eleventy-plugin-sass-lightningcss).

- To bundle scripts we use [esbuild](https://esbuild.github.io/getting-started/).

### Templating

Eleventy supports [Nunjucks](https://www.11ty.dev/docs/languages/nunjucks/) outta the box, and with similar syntax to Twig, it's an easy choice. Templating docs are [here](https://mozilla.github.io/nunjucks/templating.html https://www.11ty.dev/docs/languages/nunjucks/).

## Get Started

Once you've installed all the things:

1. Use `--serve` to start up a hot-reloading local web server, or the shorthand `npm start`. Copies of everything should be generated within the `public` directory.

```
crown % npx @11ty/eleventy --serve
[11ty] Writing public/scripts/main.js from ./src/scripts/main.js
[11ty] Writing public/sass/project.css from ./src/sass/project.scss
[11ty] Writing public/sass/style.css from ./src/sass/style.scss
[11ty] Writing public/index.html from ./src/index.md (liquid)
[11ty] Copied 8 files / Wrote 4 files in 0.06 seconds (v2.0.1)
[11ty] Watching…
[11ty] Server at http://localhost:8080/
```

2. Updates to markup and assets should refresh automatically without manual page reload.

3. Publish it online using [Netlify](https://app.netlify.com/drop):

Drag your Eleventy-generated `public` folder into the Netlify GUI.
