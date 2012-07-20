(ns mstmario.template.match
    (:use
      [hiccup.core]
      [hiccup.page])
    (require [mstmario.template.common :as common]))

(defn content []
  (common/content
    "Mst. Mario"
    (common/html-header
      "Mst. Mario"
      (include-css "/css/style.css")
      (include-js "/js/mt.js")
      (include-js "/js/socket.js")
      (include-js "/js/sequence.js")
      (include-js "/js/board.js")
      (include-js "/js/game.js")
      (include-js "/js/match.js"))
    [:div {:class "container"}
     [:div {:id "config-block"}
      "level" [:input {:id "level" :class "input-config" :type "number" :value "0"}]
      "speed" [:input {:id "speed" :class "input-config" :type "number" :value "300"}]
      [:button {:id "start-game" :class "btn btn-primary disabled" :disabled "" } "Start Game"]]
     [:div {:id "canvas-block"}]]))
