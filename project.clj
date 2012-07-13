(defproject mstmario "1.0.0-SNAPSHOT"
  :description "dr.mario clone for web"
  :dependencies [[org.clojure/clojure "1.4.0"]
                 [compojure "1.1.0-SNAPSHOT"]
                 [hiccup "1.0.0"]
                 [ring/ring-jetty-adapter "1.1.0"]
                 [ring/ring-devel "1.1.0"]
                 [org.clojure/data.json "0.1.2"]
                 [aleph "0.2.1-rc5"]]
  :daemon {:name-of-service {:ns mstmario.core
                             :pidfile "/var/run/mstmario.pid"
                             }}
  )
