import Fuse from 'fuse.js'
// import debounce from "lodash.debounce"

const ATTR_PREFIX = "data-fuzzy-sort-"
const SUBTARGET_KEY_ATTR = "data-fuzzy-sort-key"
const SUBTARGET_SELECTOR = "[data-fuzzy-sort-key]"
const TARGET_KEYS_ATTR = "data-fuzzy-sort-keys"

export default class FuzzySortElement extends HTMLElement {

    connectedCallback() {
        this._fuse = null
        this._targetElements = null
        this._fuzzySortTargets = []
        this._fuzzySortTargetsKeys = new Set()
        this._fuzzySortResults = null
        this._inputElement = this.querySelector("input")
        this._hiddenClass = this.getAttribute("data-fuzzy-sort-hidden-class")

        let namespace = this.getAttribute("select")
        let targetsSelector = namespace ? `[data-fuzzy-sort=${namespace}]` : "[data-fuzzy-sort]"

        if (targetsSelector && this._inputElement) {
            this.buildTargets(Array.from(document.querySelectorAll(targetsSelector)))
            this.go()
            this._inputElement.addEventListener("input", this.go.bind(this))
        }
    }

    get searchValue() {
        return this._inputElement.value
    }

    go() {
        if (this.searchValue && this._fuse) {
            this.fuzzySortResults = this._fuse.search(this.searchValue)
            this.setVisibilities()
        } else {
            this.resetVisibilities()
        }
    }

    buildTargets(elements) {
        this.targetElements = elements.map(element => ({
            element
        }))
        for (let targetElement of this.targetElements) {
            let targetStructure = { __ref: targetElement.element }
            // generate fuzzysearch targetStructure from data- attributes
            // given [data-fuzzy-sort-keys]
            let keysAttributeValue = targetElement.element.getAttribute(TARGET_KEYS_ATTR)
            if (keysAttributeValue) {
                let dataKeys = keysAttributeValue.split(",").map(key => key.trim())
                for (let key of dataKeys) {
                    targetStructure[key] = targetElement.element.getAttribute(ATTR_PREFIX + key)
                }
            }
            // generate fuzzysearch targetStructure from visible child elements
            let subTargetElements = targetElement.element.querySelectorAll(SUBTARGET_SELECTOR)
            for (let subTargetElement of subTargetElements) {
                let key = subTargetElement.getAttribute(SUBTARGET_KEY_ATTR) || "key"
                targetStructure[key] = subTargetElement.value || subTargetElement.textContent
                this._fuzzySortTargetsKeys.add(key)
            }
            this._fuzzySortTargets.push(targetStructure)
        }
        this._fuse = new Fuse(
            this._fuzzySortTargets,
            {
                keys: Array.from(this._fuzzySortTargetsKeys.values())
            }
        )
    }
    
    setVisibilities() {
        if (this.fuzzySortResults) {
            this.targetElements.forEach(({element}) => {
                let match = this.fuzzySortResults.find(it =>  it.item.__ref == element)
                if (match) {
                    element.classList.remove(this._hiddenClass)
                } else {
                    element.classList.add(this._hiddenClass)
                }
            })
        }
    }
    
    resetVisibilities() {
        this.targetElements.forEach(({element}) => {
            element.classList.remove(this._hiddenClass)
        })
    }
}
