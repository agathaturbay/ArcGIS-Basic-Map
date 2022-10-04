require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Search",
    "esri/widgets/Directions",
    "esri/layers/RouteLayer",
    "esri/widgets/Locate",
    "esri/rest/locator",
    "esri/Graphic",
    "esri/widgets/Home",
  ], function(esriConfig, Map, MapView, Search, Directions, RouteLayer, Locate, locator, Graphic, Home) {

    //API
    esriConfig.apiKey = "API_KEY";
    const apiKey = "API_KEY";
    const locatorUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

    //Route layer
    const routeLayer = new RouteLayer();

    //Map
    const map = new Map({
        basemap: "arcgis-navigation", 
        layers: [routeLayer]
    });
          
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-49.2929384, -25.4255897],
        zoom: 12
    });

    //Allows us to look for these specific stablishments 
    const places = ["Choose a place type...", "Parks and Outdoors", "Coffee shop", "Gas station", "Food", "Hotel"];
    const select = document.createElement("select","");
    select.setAttribute("class", "esri-widget esri-select");
    select.setAttribute("style", "width: 300px; margin: 0 0 0 375px; position: fixed; border: none; font-size: 1em; ");

    places.forEach(function(p){
        const option = document.createElement("option");
        option.value = p;
        option.innerHTML = p;
        select.appendChild(option);
    });

    function findPlaces(category, pt) {
        locator.addressToLocations(locatorUrl, {
            location: pt,
            categories: [category],
            maxLocations: 25,
            outFields: ["Place_addr", "PlaceName"]
        }).then(function(results) {
            view.popup.close();
            view.graphics.removeAll();
            results.forEach(function(result){
                view.graphics.add(
                    new Graphic({
                        attributes: result.attributes, 
                        geometry: result.location,
                        symbol: {
                            type: "simple-marker",
                            color: "#40826D",
                            size: "14px",
                            outline: {
                                color: "#ffffff",
                                width: "2px"
                            }
                        },
        
                    popupTemplate: {
                        title: "{PlaceName}", // Data attribute names
                        content: "{Place_addr}",
                    }
                }));
              });
          });
      }
    
    //Centers the search
    view.watch("stationary", function(val) {
        if (val) {
            findPlaces(select.value, view.center);
        }
    });

    //Event that changes the result based on the option selected
    select.addEventListener('change', function (event) {
        findPlaces(event.target.value, view.center);
    });


    //Create route widget
    let directionsWidget = new Directions({
        layer: routeLayer,
        apiKey,
        view,
        container: "directionsWidget"
    });

    //Search widget
    const search = new Search({
      view: view,
      container: "searchWidget"
    });

    //Locate button
    const locateBtn = new Locate ({
        view: view,
        container: "locateBtn"
    })

    const home = new Home ({
        view: view
    })

    //Position of the items on the screen
    view.ui.add(search, "top-left"); 
    view.ui.add(directionsWidget, "top-right");
    view.ui.add(locateBtn, "top-left");
    view.ui.add(select, "top-left");
    view.ui.add(home, "top-left");

});