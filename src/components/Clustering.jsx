/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'

// leaflet
import Supercluster from 'supercluster'
import L from 'leaflet'
import IconCluster from './IconCluster'

const updateMapBoundsAndZoom = (mapContext, setBounds, setZoom) => {
  if (mapContext) {
    const bounds = mapContext.getBounds()
        
    setBounds([
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat,
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat
    ])
        
    setZoom(mapContext.getZoom())
  }
}

const Clustering = ({
  dataMarker,
  mapContext,
  actionAnimationWithValue,
  currentWave,
  hideMarker,
  hidePolylines
}) => {
  // refs
  const geojsonRef = useRef()
  const superclusterRef = useRef()
  
  // states
  const [mapBounds, setMapBounds] = useState()
  const [mapZoom, setMapZoom] = useState()
  
  const createClusterIcon = (feature, latlong) => {
    if(!feature.properties.cluster) {
      // dont render marker
      // so we can keep the marker keep up to date with that position
      return null
    } else {
      // cluster marker
      return L.marker(latlong, {
        icon: IconCluster()
      })
    }
  }
  const updateCluster = () => {
    // create geojson and add to map
    if(!geojsonRef.current) geojsonRef.current = L.geoJSON(null, {
      pointToLayer: createClusterIcon
    }).addTo(mapContext)
    
    // clear prev layers
    geojsonRef.current.clearLayers()
    
    // restructure to geojson
    const pointList = dataMarker.map(item => {
      const currentLatLng = item.instance._latLngs[item.instance._latLngs.length-1]
      
      return {
        type: 'Feature',
        properties: {
          cluster: false,
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(currentLatLng[1]),
            parseFloat(currentLatLng[0]),
          ],
        },
        markerData: item,
      }
    })
    
    // supercluster
    superclusterRef.current = new Supercluster({
      radius: 60,
      extent: 256,
      maxZoom: 18,
    })
    
    // load pointlist
    superclusterRef.current.load(pointList)
    
    // get markers inside bounds (entire screen)
    const newClusterList = superclusterRef.current.getClusters(mapBounds, mapZoom)
    geojsonRef.current.addData(newClusterList)

    actionAnimationWithValue('hidePolylines', true)
    actionAnimationWithValue('hideMarkers', true)

    newClusterList.forEach(item => {
      if(!item.properties.cluster) {
        item?.markerData?.instance?.hidePolylines(hidePolylines)
        item?.markerData?.instance?.getMarker()?.hideMarker(hideMarker)
      }
    })
  }
    
  // update zoom and bounds
  useEffect(() => {
    if(mapContext) {
      if(!mapBounds) {
        updateMapBoundsAndZoom(mapContext, setMapBounds, setMapZoom)
      }
      
      mapContext.on('zoomend dragend', () => {
        updateMapBoundsAndZoom(mapContext, setMapBounds, setMapZoom)
      })
    }
  }, [mapContext])
    
  // update cluster
  useEffect(() => {
    if(mapBounds && mapZoom && dataMarker.length) {
      updateCluster()
    }
  }, [mapBounds, mapZoom, dataMarker, currentWave, hideMarker, hidePolylines])
  // so we use the currentWave for see a new position of marker and trigger updateCluster
    
  return null
}
    
export default Clustering