(ns mstmario.websock
  (:use [clojure.core.incubator :only [dissoc-in]]
        [lamina.core :only [closed? receive-all enqueue]])
  (:require [clojure.data.json :as json]))

(def handlers (atom {}))

(defn send-to
  ([c a] (send-to c a {}))
  ([c a m] (let [d (json/json-str {:action a
                                   :msg    m})]
    (enqueue (c :conn) d))))

(defn send-all [handler a m]
  (doseq [c (map #(nth % 1) (@handlers handler))]
    (send-to c a m)))

(defn data
  ([c key] (c key))
  ([c key d] (swap! handlers assoc-in [(c :handler) (c :conn) key] d)))

(defn ws-handler [dispatcher]
  (letfn [(handler [ch handshake]
            (receive-all ch
              (fn [msg]
                (if (closed? ch)
                  (let [c (get-in @handlers [handler ch])]
                    (swap! handlers dissoc-in [handler ch])
                    (dispatcher "closed" nil c))
                  (let [c (or (get-in @handlers [handler ch])
                              {:conn ch :handler handler})
                        d (json/read-json msg)
                        a (d :action)
                        m (d :msg)]
                    (swap! handlers assoc-in [handler ch] c)
                    (dispatcher a m c))))))]
    (swap! handlers assoc handler {})
    handler))
