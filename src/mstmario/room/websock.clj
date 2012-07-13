(ns mstmario.room.websock
    (:use [hiccup.core :only [h]]
          )
    (:require
      [mstmario.room.model :as model]
      [mstmario.websock :as websock]
      ))

(declare on)
(def websocket-handler (websock/ws-handler #(on %1 %2 %3)))
(def conns (atom {}))

(defn get-conn [id] (@conns id))
(defn send-all [a m]
  (websock/send-all websocket-handler a m))

(defmulti on (fn [a m c] a))
(defmethod on "MEMBER_LIST" [_ m c]
  (websock/send-to c "MEMBER_LIST" {:members (model/get-members)}))

(defmethod on "ADD_MEMBER" [_ m c]
  (let [name (h (m :name))
        id (model/add-member name)]
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
                     :opponentName (:name (model/find-member id))}))))

(defmethod on "ACCEPT_MATCH" [_ m c]
  (let [id (websock/data c :id)
        o  (m :opponentId)
        oc (get-conn o)]
    (model/accept-match id o)
    (websock/send-to oc "ACCEPT_MATCH"
           {:id o
            :opponentId  id
            :opponentName (:name (model/find-member id))})))

(defmethod on "closed" [_ _ c]
  (let [id (websock/data c :id)
        name (model/find-member id)]
    (if (not (nil? id))
      (model/delete-member id))
    (swap! conns #(dissoc % id))
    (send-all "MEMBER_DELETED" {:id id :name name})))
