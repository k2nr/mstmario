(ns mstmario.match.websock
    (:use [hiccup.core :only [h]])
    (:require
      [clojure.data.json :as json]
      [mstmario.match.model :as model]
      [mstmario.websock :as websock]))

(declare on)
(def websocket-handler (websock/ws-handler #(on %1 %2 %3)))
(def conns (atom {}))

(defn send-all [a m]
  (websock/send-all websocket-handler a m))

(defmulti on (fn [a _ _] a))
(defmethod on "REGISTER" [_ m c]
  (let [name (h (m :name))
        match-id (m :matchId)
        id (m :id)]
    (swap! conns assoc id c)
    (websock/data c :id id)
    (websock/data c :match-id match-id)
    (websock/data c :name name)
    (model/register-match match-id id name)
    (websock/send-to c "START_INFO" (:rands (model/match-data match-id)))
    (if (model/is-ready match-id)
      (doseq [i (map :id (:users (model/match-data match-id)))]
        (websock/send-to (@conns i) "READY" {})))))

(defmethod on "START_GAME" [_ m c]
  (let [match-id (websock/data c :match-id)]
    (if (model/ready-to-start match-id)
      (doseq [i (map :id (:users (model/match-data match-id)))]
        (websock/send-to (@conns i) "STARTED"))
      (model/ready-to-start match-id true))))

(defmethod on "UPDATE" [a m c]
  (send-all a m))

(defmethod on "NOTIFY" [a m c]
  (let [id (m :id)]
    (websock/send-to (@conns id) a m)))

(defmethod on "closed" [_ _ c]
  (swap! conns dissoc (websock/data c :id))
  (model/end-match (websock/data c :match-id)))

