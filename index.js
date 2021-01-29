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
    		if (e && e.error !== 'Error: Not Found');
		});
        coverMap.fitBounds(modelData.customData.bounds);
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
    		if (e && e.error !== 'Error: Not Found');
		});
        patternMap.fitBounds(modelData.customData.bounds);
    }
}

$(clientView.initiateModelLoad());
