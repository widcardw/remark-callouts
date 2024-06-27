# @widcardw/remark-callouts

> Thanks to `@portaljs/remark-callouts`.

A plugin that can transform obsidian callouts into custom container.

## Usage

Install the plugin.

```sh
npm i -D @widcardw/remark-callouts
```

Import it into remark plugin list.

```js
import { remarkCallouts } from '@widcardw/remark-callouts'
// https://astro.build/config
export default defineConfig({
  // ...
  markdown: {
    remarkPlugins: [
      remarkCallouts, 
      { 
        leadingIcon: true, // (optional, default: true) add loading icon to the start of summary
        foldIcon: true, // (optional, default: true) add fold icon to the end of summary
        customClass: '__custom_callout', // (optional) ass custom class to <detail> and <summary>
      },
    ],
  },
})
```

Import css at your web app entry.

```js
import '@widcardw/remark-callouts/index.css'
```

Then it will transform blockquotes like

```md
> [!note] This is a note
> Here is the note content.
```

into custom container.

You can add the `open` or `closed` label to set the container folded or unfolded.

```md
> [!note|closed] This is a note
> Its body will be folded by default.
```

The following callout types are supported.

|Type	|Aliases|
|-------|-------|
|note	|note, seealso|
|abstract	|abstract, summary, tldr|
|info	|info, todo|
|tip	|tip, hint, important|
|success	|success, check, done|
|question	|question, help, faq|
|warning	|warning, caution, attention|
|failure	|failure, fail, missing|
|danger	|danger, error|
|bug	|bug|
|example	|example|
|quote	|quote, cite|
