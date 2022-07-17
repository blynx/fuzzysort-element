import fuzzysort from "fuzzysort";

export type FuzzySortTargets = {
    __ref: HTMLElement
}

export type TargetElement = {
    element: HTMLElement
    matchDisplay: HTMLElement | null
}

export interface FuzzysortComponentContext {
    targetElements: Array<TargetElement>
    fuzzySortTargets: Array<FuzzySortTargets>
    fuzzySortResults: Fuzzysort.KeysResults<FuzzySortTargets>
    fuzzySortTargetsKeys: Set<string>
}

type OPTION_TYPE = {
    SUBTARGET_KEY_ATTR: string
    SUBTARGET_SELECTOR: string
    MATCHDISPLAY_SELECTOR: string
}

export const OPTION: OPTION_TYPE = {
    SUBTARGET_KEY_ATTR: "data-fuzzy-sort-key",
    SUBTARGET_SELECTOR: "[data-fuzzy-sort-key]",
    MATCHDISPLAY_SELECTOR: ".match"
}

export function buildTargets(context: FuzzysortComponentContext, elements: Array<HTMLElement>, options: OPTION_TYPE = OPTION) {
    context.targetElements = elements.map(element => ({
        element,
        matchDisplay: element.querySelector(options.MATCHDISPLAY_SELECTOR)
    }))
    for (let targetElement of context.targetElements) {
        let targetStructure: FuzzySortTargets = { __ref: targetElement.element }
        let subTargetElements: NodeListOf<HTMLInputElement> = targetElement.element.querySelectorAll(options.SUBTARGET_SELECTOR)
        for (let subTargetElement of subTargetElements) {
            let key = subTargetElement.getAttribute(options.SUBTARGET_KEY_ATTR) || "key"
            targetStructure[key] = subTargetElement.value || subTargetElement.textContent
            context.fuzzySortTargetsKeys.add(key)
        }
        context.fuzzySortTargets.push(targetStructure)
    }
}

export function go(context: FuzzysortComponentContext, search?: string) {
    if (search) {
        context.fuzzySortResults = fuzzysort.go(
            search,
            context.fuzzySortTargets,
            {
                keys: Array.from(context.fuzzySortTargetsKeys.values())
            }
        )
        setVisibilities(context)
    } else {
        resetVisibilities(context)
    }
}

export function setVisibilities(context: FuzzysortComponentContext) {
    if (context.fuzzySortResults) {
        context.targetElements.forEach(({element, matchDisplay}) => {
            let match = context.fuzzySortResults.find(it =>  it.obj.__ref == element)
            if (match) {
                element.classList.remove("hidden")
                let bestMatch = Array.from(match).sort((a, b) => {
                    if (!a) return 1
                    if (!b) return -1
                    return b.score - a.score
                })[0]
                if (matchDisplay) matchDisplay.innerHTML = fuzzysort.highlight(bestMatch) || ""
            } else {
                element.classList.add("hidden")
                if (matchDisplay) matchDisplay.innerHTML = ""
            }
        })
    }
}

export function resetVisibilities(context: FuzzysortComponentContext) {
    context.targetElements.forEach(({element, matchDisplay}) => {
        element.classList.remove("hidden")
        if (matchDisplay) matchDisplay.innerHTML = ""
    })
}