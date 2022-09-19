import fuzzysort from "fuzzysort"
import debounce from "lodash.debounce"

const TARGET_VALUE_ATTR = "data-fuzzy-sort-value"
const TARGET_KEY_ATTR = "data-fuzzy-sort-key"
const TARGET_KEYS_ATTR = "data-fuzzy-sort-keys"
const TARGET_ATTR_PREFIX = "data-fuzzy-sort-"
const TARGET_SELECTOR = "[data-fuzzy-sort-key]"
const MATCHDISPLAY_SELECTOR = "[data-fuzzy-sort-match]"
const FALLBACK_KEY = "__KEY__"

/**
 * FuzzySortElement
 * 
 *  Filter (no sorting, yet) a list of elements
 * 
 *  Usage: "Direct Target"
 * 
 *  Multiple ways to target elements which has the data directly attached to itself
 * 
 *  <fuzzy-sort select-targets=".direct-target">
 *      <input type="text" />
 *  </fuzzy-sort>
 *  <span class="direct-target">Strawberry</span> <!-- ignored -->
 *  <span class="direct-target" data-fuzzy-sort-key="">Banana</span> <!-- recognized with fallback key-->
 *  <span class="direct-target" data-fuzzy-sort-value="Orange">
 *      Orange
 *      <span>Content to be ignored</span>
 *  </span>
 *  <span class="direct-target" data-fuzzy-sort-value="Hazelnut" data-fuzzy-sort-key="Nuts">
 *      Hazelnut
 *      <span>Content to be ignored</span>
 *  </span>
 *  <span class="direct-target" 
 *        data-fuzzy-sort-keys="nuts, fruit" 
 *        data-fuzzy-sort-nuts="Hazelnut Walnut"
 *        data-fuzzy-sort-fruit="Raisin Mango Banana">
 *      Nuts & Dried Fruit Mix
 *      <span>Content to be ignored</span>
 *  </span>
 * 
 * 
 *  Usage: "Subtargets"
 * 
 *  Filter more complex elements where data is taken from children
 * 
 *  <fuzzy-sort select-targets=".complex-target">
 *      <input type="text" />
 *  </fuzzy-sort>
 *  <div class="complex-target">
 *      <h3 data-fuzzy-sort-key="heading">Banana Bread Recipe</h3>
 *      <ul data-fuzzy-sort-key="ingredients" data-fuzzy-sort-value="...">
 *          ...
 *      </ul>
 *      <p data-fuzzy-sort-key="instructions">...</p>
 *      <input type="text" value="Input Example" data-fuzzy-sort-key="value-from-input" />
 *  </div>
 *  
 */
export default class FuzzySortElement extends HTMLElement {

    connectedCallback() {
        this._targetElements = null
        this._fuzzySortTargets = []
        this._fuzzySortTargetsKeys = new Set()
        this._fuzzySortResults = null
        this._inputElement = this.querySelector("input")
        this._hiddenClass = this.getAttribute("hidden-class")
        this._treeRoot = document.querySelector(this.getAttribute("tree"))
        
        // ability to use custom selector
        let targetsSelector = this.getAttribute("select-targets")

        if (targetsSelector && this._inputElement) {
            this.buildTargets(Array.from(document.querySelectorAll(targetsSelector)))
            this.go()
            this._inputElement.addEventListener("input", debounce(this.go.bind(this), 320))
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
        this._targetElements = elements.map(element => ({
            element,
            matchDisplay: element.querySelector(MATCHDISPLAY_SELECTOR)
        }))

        for (let targetElement of this._targetElements) {
            let targetStructure = { 
                __ref: targetElement.element, 
                __parents: [],
            }

            // given tree, prepare parents which are targets
            if (this._treeRoot instanceof HTMLElement) {
                let node = targetElement.element.parentNode
                while (node != this._treeRoot) {
                    if (elements.includes(node)) targetStructure.__parents.push(node)
                    node = node.parentNode
                }
            }

            // given direct target with data-fuzzy-sort-key and/or data-fuzzy-sort-value="..."
            let directValue = targetElement.element.getAttribute(TARGET_VALUE_ATTR)
            if (directValue || targetElement.element.hasAttribute(TARGET_KEY_ATTR)) {
                let key = targetElement.element.getAttribute(TARGET_KEY_ATTR) || FALLBACK_KEY
                let valueFromAttribute = targetElement.element.getAttribute(TARGET_VALUE_ATTR)
                targetStructure[key] = valueFromAttribute || targetElement.element.value || targetElement.element.textContent
                this._fuzzySortTargetsKeys.add(key)
            }

            // given direct target with data-fuzzy-sort-keys="key1, key2, ..." and data-fuzzy-sort-key1="value..."
            let directKeys = targetElement.element.getAttribute(TARGET_KEYS_ATTR)
            if (directKeys) {
                let dataKeys = directKeys.split(",").map(key => key.trim())
                for (let key of dataKeys) {
                    targetStructure[key] = targetElement.element.getAttribute(TARGET_ATTR_PREFIX + key)
                    this._fuzzySortTargetsKeys.add(key)
                }
            }

            // given target with childnodes with [data-fuzzy-sort-key]
            let subTargetElements = targetElement.element.querySelectorAll(TARGET_SELECTOR)
            for (let subTargetElement of subTargetElements) {
                let key = subTargetElement.getAttribute(TARGET_KEY_ATTR) || FALLBACK_KEY
                let valueFromAttribute = subTargetElement.getAttribute(TARGET_VALUE_ATTR)
                targetStructure[key] = valueFromAttribute || subTargetElement.value || subTargetElement.textContent
                this._fuzzySortTargetsKeys.add(key)
            }
            this._fuzzySortTargets.push(targetStructure)
        }
        console.log(this, this._fuzzySortTargets)
    }
    
    setVisibilities() {
        if (this.fuzzySortResults) {
            let treeElementsToShow = new Set()
            this._targetElements.forEach(({element, matchDisplay}) => {
                let match = this.fuzzySortResults.find(it =>  it.obj.__ref == element)
                if (match) {
                    element.classList.remove(this._hiddenClass)
                    if (this._treeRoot) match.obj.__parents.forEach(p => treeElementsToShow.add(p))
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
            treeElementsToShow.forEach(te => te.classList.remove(this._hiddenClass))
        }
    }
    
    resetVisibilities() {
        this._targetElements.forEach(({element, matchDisplay}) => {
            element.classList.remove(this._hiddenClass)
            if (matchDisplay) {
                matchDisplay.classList.add(this._hiddenClass)
                matchDisplay.innerHTML = ""
            }
        })
    }
}
