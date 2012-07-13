(ns mstmario.template.room
    (:use
      [hiccup.core]
      [hiccup.page])
    (require [mstmario.template.common :as common]))

(defn member-add-form []
  (html
    [:div
      "名前"
      [:input {:id "register-text" :type "text" :class "input-medium"}]
      [:button {:id "register-btn" :class "btn btn-primary"} "登録"]]
    [:div {:id "accept-message" :style "display: none;"}
     [:form {:id "accept-form" :class "well" :action "/match/" :method "post"}
      [:span {:id "accept-opponent-name"}] " wants to match with you. Will you accept?"
      [:input {:id "accept-match-id" :type "hidden" :name "match-id"}]
      [:input {:id "accept-member-id" :type "hidden" :name "member-id"}]
      [:button {:type "submit" :id "accept-btn" :class "btn btn-primary"} "Accept"]]
     ]
    [:div {:id "start-game-message" :style "display: none;"}
     [:form {:id "start-game-form" :class "well" :method "post"}
      [:span {:id "start-game-opponent-name"}] " accepted your request. Start game?"
      [:input {:id "start-game-match-id" :type "hidden" :name "match-id"}]
      [:input {:id "start-game-member-id" :type "hidden" :name "member-id"}]
      [:button {:type "submit" :id "start-game-btn" :class "btn btn-primary"} "Start Game"]]
         ] ))

(defn content []
  (common/content
    "Mst. Mario"
    (common/html-header
      "Mst. Mario"
      (include-css "/css/style.css")
      (include-js "/js/socket.js") 
      (include-js "/js/room.js"))
    [:div {:class "container"}
     (member-add-form)
     [:div
      [:table {:class "table table-striped table-condensed"}
       [:thead
        [:tr
         [:th "対戦待ちユーザー"]]]
       [:tbody {:id "member-list"}]]]
    ]))
