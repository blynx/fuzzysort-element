# Fuzzy Sort Elements based on [fuzzysort](https://github.com/farzher/fuzzysort) lib

Comparison between different approaches to build a fuzzy filtering and sorting component based on the [fuzzysort library](https://github.com/farzher/fuzzysort).

Alternative: https://fusejs.io/

## GitHub Catalyst

https://github.github.io/catalyst/

The Component encapsulates just the input block. The Custom Element provides an attribute (`@attr targetsSelector`) to configure the target selector for querying the target elements *which are not children of the component itself*.

## Plain Custom Element

https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements

Same principle as with Catalyst, just a plain JS Custom Element, no Typescript.

### Fuse.js

Another test with fuse.js here. Though it does not provide `highlight()`: Not quite clear why and how certain phrases match.

## Hotwired Stimulus

https://stimulus.hotwired.dev/

The component context spans over the input block as well as the item list block. Therefore the items are being targeted via Stimulus targets `data-fuzzysort-target="item"`.

## Stencil.js

https://stenciljs.com/

TBD

## Svelte

TBD
