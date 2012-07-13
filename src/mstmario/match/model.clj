(ns mstmario.match.model)

(def matches (atom {}))

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
