import { Controller } from "@hotwired/stimulus"
import "fuzzysort"

import { 
    FuzzysortComponentContext,
    TargetElement,
    FuzzySortTargets,
    OPTION,
    buildTargets,
    go,
} from "../../../shared"

const SUBTARGET_KEY_ATTR = "data-fuzzysort-key"
const SUBTARGET_SELECTOR = "[data-fuzzysort-key]"

export default class extends Controller implements FuzzysortComponentContext {
    static targets = ["debug", "input", "item"]
    
    // add stimulus targets to please typescript:
    debugTarget: HTMLElement
    inputTarget: HTMLInputElement
    itemTargets: Array<HTMLElement>

    targetElements: Array<TargetElement>
    fuzzySortTargets: Array<FuzzySortTargets> = []
    fuzzySortResults: Fuzzysort.KeysResults<FuzzySortTargets>
    fuzzySortTargetsKeys: Set<string> = new Set()

    connect() {
        buildTargets(this, this.itemTargets, {
            ...OPTION,
            SUBTARGET_KEY_ATTR,
            SUBTARGET_SELECTOR
        })
        this.go()
    }

    go() {
        go(this, this.inputTarget.value)
    }
}
