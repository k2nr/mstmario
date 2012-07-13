(ns mstmario.match.controller
    (:use [compojure.core :only [defroutes GET POST]]
          [aleph.http :only [wrap-aleph-handler]]
          )
    (:require [mstmario.match.view :as view]
              [mstmario.match.model :as model]
              [mstmario.match.websock :as websock]
              ))

(defn index [] (view/index))

(defn match-index [params]
  (let [t "player"]
    {:cookies {"type" t}
     :body (index)}))

(defroutes routes
  (GET  "/match/ws" [] (wrap-aleph-handler websock/websocket-handler))
  (GET  "/match/single" [] {:cookies {"type" "default"} :body (index)})
  (GET  "/match/:id" [id] {:cookies {"type" "audience"} :body (index)})
  (POST "/match/:id" {params :params} (match-index params)))
