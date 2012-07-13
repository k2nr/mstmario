(ns mstmario.room.controller
    (:use [compojure.core :only [defroutes GET POST]]
          [aleph.http :only [wrap-aleph-handler]]
          )
    (:require [clojure.string :as string]
              [mstmario.room.view :as view]
              [mstmario.room.model :as model]
              [mstmario.room.websock :as websock]
             ))


(defn index []
  (view/index))

(defn add-member [params]
  (let [name (:name params)]
    (when-not (string/blank? name)
      (model/add-member name))))

(defroutes routes
  (GET "/" [] (index))
  (GET "/ws" [] (wrap-aleph-handler websock/websocket-handler))
  (POST "/" {params :params} (add-member)))

