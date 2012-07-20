(ns mstmario.match.model
    (:use [hiccup.core :only [h]])
    (:require
      [clojure.data.json :as json]
      [mstmario.websock :as websock]))

(declare on)
(def matches (atom {}))
(def websocket-handler (websock/ws-handler #(on %1 %2 %3)))
(def conns (atom {}))

(defn make-rands []
  {:boardRandSeed (rand-int (Math/pow 2 31))
   :blockRandSeed (rand-int (Math/pow 2 31))})

(defn register-match [match-id id name]
  (let [d (@matches match-id)
        e (if (empty? d) [] (:users d))
        rands (if (empty? d) (make-rands) (:rands d))]
    (swap! matches assoc match-id
           {:users (conj e {:id id :name name})
            :rands rands
            :to-start false})))

(defn is-ready [match-id]
  (= (count (:users (@matches match-id))) 2))

(defn ready-to-start
  ([id] (get-in @matches [id :to-start]))
  ([id ready]
   (swap! matches assoc-in [id :to-start] ready)))

(defn match-data [id] (@matches id))

(defn end-match [id]
  (swap! matches dissoc id))

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
    (register-match match-id id name)
    (websock/send-to c "START_INFO" (:rands (match-data match-id)))
    (if (is-ready match-id)
      (doseq [i (map :id (:users (match-data match-id)))]
        (websock/send-to (@conns i) "READY" {})))))

(defmethod on "START_GAME" [_ m c]
  (let [match-id (websock/data c :match-id)]
    (if (ready-to-start match-id)
      (doseq [i (map :id (:users (match-data match-id)))]
        (websock/send-to (@conns i) "STARTED"))
      (ready-to-start match-id true))))

(defmethod on "UPDATE" [a m c]
  (send-all a m))

(defmethod on "NOTIFY" [a m c]
  (let [id (m :id)]
    (websock/send-to (@conns id) a m)))

(defmethod on "closed" [_ _ c]
  (swap! conns dissoc (websock/data c :id))
  (end-match (websock/data c :match-id)))
