import fuzzysort from "fuzzysort"
// import debounce from "lodash.debounce"

const TARGET_ATTR = "data-fuzzy-sort"
const TARGET_SELECTOR = "[data-fuzzy-sort]"
const ATTR_PREFIX = "data-fuzzy-sort-"
const SUBTARGET_SELECTOR = "[data-fuzzy-sort-key]"
const SUBTARGET_KEY_ATTR = "data-fuzzy-sort-key"
const SUBTARGET_VALUE_ATTR = "data-fuzzy-sort-value"
const MATCHDISPLAY_SELECTOR = "[data-fuzzy-sort-match]"

export default class FuzzySortElement extends HTMLElement {

    connectedCallback() {
        this._targetElements = null
        this._fuzzySortTargets = []
        this._fuzzySortTargetsKeys = new Set()
        this._fuzzySortResults = null
        this._inputElement = this.querySelector("input")
        this._hiddenClass = this.getAttribute("data-fuzzy-sort-hidden-class")
        
        // ability to use custom selector
        let customTargetsSelector = this.getAttribute("data-fuzzy-sort-select") 
        let targetsSelector = customTargetsSelector || TARGET_SELECTOR

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
        if (this.searchValue) {
            this.fuzzySortResults = fuzzysort.go(
                this.searchValue,
                this._fuzzySortTargets,
                {
                    keys: Array.from(this._fuzzySortTargetsKeys.values())
                }
            )
            this.setVisibilities()
        } else {
            this.resetVisibilities()
        }
    }

    buildTargets(elements) {
        this.targetElements = elements.map(element => ({
            element,
            matchDisplay: element.querySelector(MATCHDISPLAY_SELECTOR)
        }))
        for (let targetElement of this.targetElements) {
            let targetStructure = { __ref: targetElement.element }
            // generate fuzzysearch targetStructure from data- attributes
            // given data-fuzzy-sort="key1, key2, ..." -> data-fuzzy-sort-key1="value..."
            let directKeys = targetElement.element.getAttribute(TARGET_ATTR)
            if (directKeys) {
                let dataKeys = directKeys.split(",").map(key => key.trim())
                for (let key of dataKeys) {
                    targetStructure[key] = targetElement.element.getAttribute(ATTR_PREFIX + key)
                }
            }
            // generate fuzzysearch targetStructure from targets child elements contents
            let subTargetElements = targetElement.element.querySelectorAll(SUBTARGET_SELECTOR)
            for (let subTargetElement of subTargetElements) {
                let key = subTargetElement.getAttribute(SUBTARGET_KEY_ATTR) || "key"
                let valueFromAttribute = subTargetElement.getAttribute(SUBTARGET_VALUE_ATTR)
                targetStructure[key] = valueFromAttribute || subTargetElement.value || subTargetElement.textContent
                this._fuzzySortTargetsKeys.add(key)
            }
            this._fuzzySortTargets.push(targetStructure)
        }
    }
    
    setVisibilities() {
        if (this.fuzzySortResults) {
            this.targetElements.forEach(({element, matchDisplay}) => {
                let match = this.fuzzySortResults.find(it =>  it.obj.__ref == element)
                if (match) {
                    element.classList.remove(this._hiddenClass)
                    let bestMatch = Array.from(match).sort((a, b) => {
                        if (!a) return 1
                        if (!b) return -1
                        return b.score - a.score
                    })[0]
                    if (matchDisplay) {
                        matchDisplay.classList.remove(this._hiddenClass)
                        matchDisplay.innerHTML = fuzzysort.highlight(bestMatch) || ""
                    }
                } else {
                    element.classList.add(this._hiddenClass)
                    if (matchDisplay) {
                        matchDisplay.classList.add(this._hiddenClass)
                        matchDisplay.innerHTML = ""
                    }
                }
            })
        }
    }
    
    resetVisibilities() {
        this.targetElements.forEach(({element, matchDisplay}) => {
            element.classList.remove(this._hiddenClass)
            if (matchDisplay) {
                matchDisplay.classList.add(this._hiddenClass)
                matchDisplay.innerHTML = ""
            }
        })
    }
}
