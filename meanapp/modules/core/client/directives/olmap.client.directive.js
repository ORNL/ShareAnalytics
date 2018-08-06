(function () {
    'use strict';
  
    angular.module('core')
      .directive('olmap', olmap);
    
    olmap.$inject = [];      

    function olmap() {
      var directive = {
        restrict: 'E',
        require: 'ngModel',
        link: link,
        template: "<div id='themap' style='width: 100%; height: 300px'><div style='padding-bottom:26px;width:200px;' id='popup'></div></div>"
      };
  
      return directive;

      function link(scope, elem, attrs, ngModel) {    

       scope.$watch(attrs.ngModel, function () {
           render();
       });

       var render = function () {

        var data = ngModel.$modelValue;        
        
        //Use code similar to the following if using custom tile server
        /*layers: [
          new ol.layer.Tile({
            //changed source from default OSM to XYZ source
            //click on XYZ under OSM bright or Klokantech-basic to get relevant link on the server homepage
            source: new ol.source.XYZ({
              url: 'http://address:port/styles/klokantech-basic/{z}/{x}/{y}.png'
            })
          })
        ]*/
        var map = new ol.Map({
          target: "themap",
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM()
            })
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([data.center.lon,data.center.lat]),
            zoom: 12
          })
        });        
        
        var facilityFeatures=[];

        //Main Facility from campaign
        var facilityFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.transform([data.center.lon,data.center.lat], 'EPSG:4326',     
          'EPSG:3857')),
          name: data.center.label,
          description: 'A Facility'
        });
        
        facilityFeatures.push(facilityFeature);

        var facilityVectorSource = new ol.source.Vector({
          features: facilityFeatures //add an array of features
        });
        
        var facilityStyle = new ol.style.Style({
          text: new ol.style.Text({
            text: '\uf015',
            font: 'normal 26px FontAwesome',
            textBaseline: 'bottom',
            fill: new ol.style.Fill({
              color: 'black'
            })
          })
        });
        
        var vectorLayer = new ol.layer.Vector({
          source: facilityVectorSource,
          style: facilityStyle
        });

        map.addLayer(vectorLayer);

        //Code to display hover text for markers
        var element = document.getElementById('popup');
        
        var popup = new ol.Overlay({
          element: element,
          positioning: 'bottom-center',
          stopEvent: false
        });
        map.addOverlay(popup);

        map.on('pointermove', function(evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel,
              function(feature, layer) {
                return feature;
            });

            if (feature) {              
              var geometry = feature.getGeometry();
              var coord = geometry.getCoordinates();
              popup.setPosition(coord);
              $(element).popover({
                'placement': 'top',
                'html': true,
                'content': feature.get('name') + " " + feature.get('distance') + " km"
              });
              //because popover('destroy') was misbehaving, changing content dynamically before showing popover again
              if(feature.get('distance')!=undefined) {
                $(element).data('bs.popover').options.content = feature.get('name')+ ", " + feature.get('distance') + " km";                
              } else {
                $(element).data('bs.popover').options.content = feature.get('name');                
              }
              $(element).popover('show');
            } else {
              $(element).popover('hide'); //using 'destroy' was causing issues - may be bootstrap version
            }
        });

      };

    }
    }
  }());