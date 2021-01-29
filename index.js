'use strict';

let clientView = {
    initiateModelLoad: function(){
        //update url to heroku when deployed 
        $.ajax({
            url: 'https://bdcbuildpdfapp.herokuapp.com/jobData', 
            method: 'GET',  
            success: clientView.handleCustomData,
            error: function(xhr, ajaxOptions, thrownError){
                var errorMessage = xhr.status + ': ' + xhr.statusText;
                throw new Error(errorMessage, thrownError);
            }
        });
    },
    handleCustomData: function(data){
        mapboxgl.accessToken = data.mapbox_key;
	    let sw = new mapboxgl.LngLat(data.bounds._southWest.lng, data.bounds._southWest.lat);
	    let ne = new mapboxgl.LngLat(data.bounds._northEast.lng, data.bounds._northEast.lat);
	    let bounds = new mapboxgl.LngLatBounds(sw, ne);
        modelData.customData = {
            zoom: data.zoom,
            w: data.width,
            h: data.height,
            center: data.center,
            bounds: bounds
        }
        $('#mapCover').css({"width": `${data.width}px`, "height": `${data.height}px`});
        $('#heartImgCover').css({"width": `${data.width}px`, "height": `${data.height}px`});
        $('#mapPattern').css({"top": `${data.height}px`, "width": `${data.width}px`, "height": `${data.height}px`});
        $('#heartImgPattern').css({"top": `${data.height}px`, "width": `${data.width}px`, "height": `${data.height}px`});
        clientView.buildMaps(data.maptiler_key);
    },
    buildMaps: function(stylekey){
        //let deafultZoom = 12; 
        //let deafultCenter = [-74.0060, 40.7128]; 
       // let bearing = modelData.map.getBearing(); //data.bearing
       // let pitch = modelData.map.getPitch();  //data.pitch
        //cover
        let coverMap = new mapboxgl.Map({
            container: 'mapCover',
            center: modelData.customData.center,
            zoom: modelData.customData.zoom,
            style: `${modelData.mapbox_Styles.style_url}${stylekey}`,
            interactive: false,
            preserveDrawingBuffer: true,
            fadeDuration: 0,
            attributionControl: false
        });
        coverMap.on('error', e => {
    		if (e && e.error !== 'Error: Not Found'){
 			throw new Error('Error with building cover map: ' + e);
		    }
	    });
        //pattern
        let patternMap = new mapboxgl.Map({
            container: 'mapPattern',
            center: modelData.customData.center,
            zoom: modelData.customData.zoom,
            style: `${modelData.mapbox_Styles.pattern_url}${stylekey}`,
            interactive: false,
            preserveDrawingBuffer: true,
            fadeDuration: 0,
            attributionControl: false
        });
        patternMap.on('error', e => {
    		if (e && e.error !== 'Error: Not Found'){
 			throw new Error('Error with building pattern map: ' + e);
		}
	    });

        coverMap.once('idle', function(){
            patternMap.once('idle', function(){
                clientView.adjustTrafficStyle(coverMap, 'Cover');
                clientView.adjustTrafficStyle(patternMap, 'Pattern');
            });
        });

        coverMap.fitBounds(modelData.customData.bounds);
        patternMap.fitBounds(modelData.customData.bounds);
    },
    adjustTrafficStyle: function(map, type){ 
        let browserZoom = modelData.customData.zoom;
        const getZoomArray = async function(){
            let zoomArray = await modelData.trafficLayers.map(obj => {
                let zoomObj = obj.zooms.find(obj => obj.zoom >= browserZoom);
                let lineWidth = zoomObj.lineWidth * Math.pow(1.2, (browserZoom - zoomObj.zoom)); 
                //lines look small on output, so multiply by 2      	
                return {name: obj.name, line: (lineWidth*2)};
            });	
            return zoomArray;
        };
        const paintRoads = async function(arr){
            try {
                await arr.forEach(async(obj) => {
                    await map.setPaintProperty(obj.name, 'line-width', obj.line);
                });
                return;
            }
            catch(e){
                throw e;
            }
        };  
    
        getZoomArray().then((array) => {
            return paintRoads(array);
        }).then(() => {
            let divString = '#map' + type + '-done';
            $(divString).css('visibility', 'hidden');
        }).catch((e) => {
            throw new Error('Error in adjust traffic styles: ' + e);
        });
    },
}

$(clientView.initiateModelLoad());
