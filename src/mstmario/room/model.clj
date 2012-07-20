(ns mstmario.room.model
    (:use [hiccup.core :only [h]])
    (:require
      [mstmario.websock :as websock]
      ))

(declare on)
(def members (atom {}))
(def auto-id (atom 0))
(def matches (atom {}))
(def websocket-handler (websock/ws-handler #(on %1 %2 %3)))
(def conns (atom {}))

(defn add-member [name]
    (let [id (swap! auto-id inc)]
      (swap! members assoc id {:id id :name name})
      (swap! matches assoc id {:id id})
      id))

(defn get-members [] @members)

(defn delete-member [id]
  (swap! members dissoc id))

(defn find-member [id]
  ((deref members) id))

(defn accept-match [id o]
  (swap! matches assoc id {:id id :opponent o}))

(defn get-conn [id] (@conns id))
(defn send-all [a m]
  (websock/send-all websocket-handler a m))

(defmulti on (fn [a m c] a))
(defmethod on "MEMBER_LIST" [_ m c]
  (websock/send-to c "MEMBER_LIST" {:members (get-members)}))

(defmethod on "ADD_MEMBER" [_ m c]
  (let [name (h (m :name))
        id (add-member name)]
    (swap! conns assoc id c)
    (websock/data c :id id)
    (websock/send-to c "NOTIFY_ID" {:id id})
    (send-all "MEMBER_ADDED" {:id id :name name})))

(defmethod on "REQUEST_MATCH" [_ m c]
  (let [o  (m :opponentId)
        oc (get-conn o)
        id (websock/data c :id)]
    (if (not (nil? oc))
      (websock/send-to oc "REQUEST_MATCH"
                    {:id o
                     :opponentId id
                     :opponentName (:name (find-member id))}))))

(defmethod on "ACCEPT_MATCH" [_ m c]
  (let [id (websock/data c :id)
        o  (m :opponentId)
        oc (get-conn o)]
    (accept-match id o)
    (websock/send-to oc "ACCEPT_MATCH"
           {:id o
            :opponentId  id
            :opponentName (:name (find-member id))})))

(defmethod on "closed" [_ _ c]
  (let [id (websock/data c :id)
        name (find-member id)]
    (if (not (nil? id))
      (delete-member id))
    (swap! conns #(dissoc % id))
    (send-all "MEMBER_DELETED" {:id id :name name})))
