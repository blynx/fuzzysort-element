import { Application } from "@hotwired/stimulus"

import FuzzysortController from "./controllers/fuzzysort_controller"

declare global {
    interface Window { 
        Stimulus: any
    }
}

window.Stimulus = Application.start()
window.Stimulus.register("fuzzysort", FuzzysortController)
