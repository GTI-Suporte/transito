pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"

pin_all_from "app/javascript/controllers", under: "controllers"

pin "dashboard", to: "dashboard.js"
pin "mapa_fiscalizacao", to: "mapa_fiscalizacao.js"
pin "mapa_semaforo", to: "mapa_semaforo.js"