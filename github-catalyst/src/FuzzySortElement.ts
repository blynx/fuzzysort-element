import { controller, target, attr } from "@github/catalyst"
import { debounce } from "@github/mini-throttle/decorators"
import "fuzzysort"

import { 
    FuzzysortComponentContext,
    TargetElement,
    FuzzySortTargets,
    buildTargets,
    go,
} from "../../shared"

@controller
export default class FuzzySortElement extends HTMLElement implements FuzzysortComponentContext {
    @target input: HTMLInputElement
    @target debug: HTMLElement
    @attr targetsSelector // query "foreign" elements by configurable selector

    targetElements: Array<TargetElement>
    fuzzySortTargets: Array<FuzzySortTargets> = []
    fuzzySortResults: Fuzzysort.KeysResults<FuzzySortTargets>
    fuzzySortTargetsKeys: Set<string> = new Set()

    connectedCallback() {
        buildTargets(this, Array.from(document.querySelectorAll(this.targetsSelector)))
        this.__go()
    }

    private __go() {
        go(this, this.input.value)
    }

    @debounce(400)
    go() {
        this.__go()
    }
}
