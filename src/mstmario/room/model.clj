(ns mstmario.room.model)

(def members (atom {}))
(def auto-id (atom 0))
(def matches (atom {}))

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
