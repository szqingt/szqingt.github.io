import FancyLinkCmp from './FancyLinkWebComponent'


function init(previewPath: string) {
  if (!customElements.get('fancy-link')) {

  
    customElements.define(
      'fancy-link',
      class FancyLink extends FancyLinkCmp {
        constructor() {
          super();
          this.previewPath = previewPath
        }
      }
    )
  }
}

// @ts-expect-error runtime replace
init(__previewPath)