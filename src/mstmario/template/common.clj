(ns mstmario.template.common
    (:use [hiccup.core]
          [hiccup.page]))

(defn html-header [title & headers]
  [:head
   [:meta {:charset "utf-8"}]
   [:meta {:name "viewport" :content "width=device-width, initial-scale=1.0"}]
   [:meta {:name "description" :content ""}]
   [:meta {:name "author" :content ""}]
   [:title title]
   (include-css "/css/bootstrap.css")
   [:style "body { padding-top: 60px; }"]
   (include-css "/css/style.css")
   (include-css "/css/bootstrap-responsive.css")
   (include-js "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js")
   headers]
  )

(defn content [title header & body]
  (html5
    header
    [:body
     #_[:div {:class "navbar navbar-fixed-top"}
      [:div {:class "navbar-inner"}
       [:div {:class "container"}
        [:a {:class "btn btn-navbar" :data-toggle "collapse" :data-target ".nav-collapse"}
         [:span {:class "icon-bar"}]
         [:span {:class "icon-bar"}]
         [:span {:class "icon-bar"}]
         ]
        [:a {:class "brand" :href "#"} "Project Name"]
        [:div {:class "nav-collapse"}
         [:ul {:class "nav"}
          [:li {:class "active"}
           [:a {:href "#"} "Home"]]
          [:li
           [:a {:href "#about"} "About"]]
          [:li
           [:a {:href "#contact"} "Contact"]]]]]]]
     [:content
      [:h1 title] body]]))

(defn not-found []
  (content "Not Found"
    (html-header "Mst. Mario")
    [:div {:class "container"}
     [:div {:class "hero-unit"}
      "The Page You Requested Is Not Found"]]))
