(ns mstmario.core
  (:gen-class)
  (:use
    [compojure.core :only [defroutes]]
    [compojure.route :only  [not-found files resources]]
    [aleph.http :only [start-http-server wrap-ring-handler]]
    )
  (:require [compojure.handler :as handler]
            [mstmario.template.common :as template]
            [mstmario.room.controller :as rcontroller]
            [mstmario.match.controller :as mcontroller]
           ))

(defroutes main-routes
  rcontroller/routes
  mcontroller/routes
  (files "/")
  (resources "/")
  (not-found (template/not-found)))

(defn start [port app]
  (start-http-server app {:port port :websocket true}))

(def app (wrap-ring-handler (handler/site main-routes)))

(defn -main []
  (let [port (Integer/parseInt (or (System/getenv "PORT") "8080"))]
    (start port app)))

