/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import * as ReactDOMServer from 'react-dom/server'

// leaflet
import L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'l.movemarker'
//import '../L.MoveMarker/L.MoveMarker'
//import './L.MoveMarker/L.Bundle'

// constants
import { firstInit, getStates } from '../constants/constants'

// components
import Button from '../components/Button'
import Clustering from '../components/Clustering'

const Map = () => {
  const intervalRef = useRef(null)
  const currentWaveRef = useRef(1)
  const [currentWave, setCurrentWave] = useState(1)

  // states
  const [mapContext, setMapContext] = useState()
  const [dataMarker, setDataMarker] = useState([])
  const [dataAdded, setDataAdded] = useState(false)

  // action
  const [ hidePolylines, setHidePolylines ] = useState(false)
  const [ hideMarker, setHideMarker ] = useState(false)
  const [ animateMarker, setAnimateMarker ] = useState(true)
  const [ animatePolyline, setAnimatePolyline ] = useState(true)
  const animatePolylineRef = useRef(true)

  // action L.MoveMarker
  const actionAnimation = (type) => {
    dataMarker.forEach(item => {
      if(item?.instance) {
        type === 'hidePolylines' && item.instance.hidePolylines(hidePolylines)
        type === 'hideMarkers' && item.instance.getMarker().hideMarker(hideMarker)
        type === 'stopAll' && item.instance.stop()
        type === 'disableAllFollowMarker' && item.instance?.getMarker()?.activeFollowMarker(false)
        type === 'activeAnimMarker' && item.instance?.getMarker()?.activeAnimate(animateMarker)
        type === 'activeAnimPolyline' && item.instance?.getCurrentPolyline()?.activeAnimate(animatePolyline)
      }
    })
  }

  const actionAnimationWithValue = (type, value) => {
    dataMarker.forEach(item => {
      if(item?.instance) {
        type === 'hidePolylines' && item.instance.hidePolylines(value)
        type === 'hideMarkers' && item.instance.getMarker().hideMarker(value)
        type === 'stopAll' && item.instance.stop()
        type === 'disableAllFollowMarker' && item.instance?.getMarker()?.activeFollowMarker(value)
        type === 'activeAnimMarker' && item.instance?.getMarker()?.activeAnimate(value)
        type === 'activeAnimPolyline' && item.instance?.getCurrentPolyline()?.activeAnimate(value)
      }
    })
  }

  const createInstance = (latLngs) => {
    return L.moveMarker(latLngs,
      {
        animate: animatePolyline,
        color: 'red',
        weight: 10,
        hidePolylines: hidePolylines,
        duration: 5000,
        removeFirstLines: true,
        maxLengthLines: 3,
      },
      {
        animate: animateMarker,
        hideMarker: hideMarker,
        duration: 5000,
        speed: 0,
        followMarker: false,
        rotateMarker: true,
        rotateAngle: 210,
        icon: L.divIcon({
          className: 'position-relative rotate--marker',
          html: ReactDOMServer.renderToString(
            <div>
              <img
                style={{ width: '50px' }}
                src="https://www.pngkit.com/png/full/54-544296_red-top-view-clip-art-at-clker-cartoon.png"
              />
            </div>
          ),
        })
      },
      {
  
      }).addTo(mapContext)
  }

  // first init create instance L.MoveMarker after mapContext has context
  useEffect(() => {
    if (mapContext && firstInit.length && !dataAdded) {
      const createMarkers = firstInit.map(item => {
        if (item.latLng.length) return {
          trackId: item.trackId,
          label: item.label,
          instance: createInstance([item.latLng])
        }
      })
      setDataMarker(createMarkers)
      setDataAdded(true)
    }
  }, [mapContext])

  // this side effect after dataMarker has data
  // this side effect called once
  useEffect(() => {
    if(dataAdded) {
      if(mapContext) {
        mapContext.on('zoomend dragend', () => {
          // disable all follow marker when zoom and drag on map
          actionAnimation('disableAllFollowMarker')
        })
      }

      // set event on click for handle follow marker
      dataMarker.forEach(item => {
        if(item?.instance) {
          item.instance.getMarker().on('click', () => {
            actionAnimation('disableAllFollowMarker')
            item?.instance?.getMarker()?.activeFollowMarker(true)
          })
        }
      })
      
      // after data added, then set interval fetch states lat lng
      intervalRef.current = setInterval(() => {
        getStates[currentWaveRef.current-1].map(itemState => {
          const findTracker = dataMarker.find(itemFind => itemFind.trackId === itemState.trackId)
          findTracker && findTracker?.instance?.addMoreLine(itemState.latLng, {
            rotateAngle: itemState.heading,
            // because state cant update inside interval, we can use useRef
            animatePolyline: animatePolylineRef.current
          })
        })
        currentWaveRef.current = currentWaveRef.current+1
        setCurrentWave(currentWaveRef.current)
      }, 6000)
      // fetching duration more than duration L.MoveMarker
      // example L.moveMarker 10 seconds then fetching must 11 seconds
      // if it same duration, you will got bug
      // bug: marker anim will always start from first init lat lng
      // i will fix this, give me a time
    }
  }, [dataAdded])

  useEffect(() => {
    // uncomment these if dont use cluster
    //if(dataMarker.length) actionAnimation('hidePolylines')
    //if(dataMarker.length) actionAnimation('hideMarkers')
    if(dataMarker.length) actionAnimation('activeAnimMarker')
    if(dataMarker.length) actionAnimation('activeAnimPolyline')
  }, [hidePolylines, hideMarker, animateMarker, animatePolyline])

  return (
    <div className='h-[100vh] w-full relative'>
      {/* panel play */}
      <div className='absolute top-3 right-3 bg-white z-[9999]  p-3 rounded-md max-w-[240px] w-full'>
        {/* stop */}
        <Button onClick={() => actionAnimation('stopAll')}>
          stop all animate
        </Button>

        {/* stop */}
        <Button onClick={() => actionAnimation('disableAllFollowMarker')}>
          disable all follow marker
        </Button>

        <p className='text-sm mb-2'>click the marker for follow marker</p>
        
        <h3 className='text-md font-semibold mb-2'>Hide Feature</h3>

        {/* hide polylines */}
        <Button onClick={() => setHidePolylines(!hidePolylines)}>
          {hidePolylines ? 'show' : 'hide'} polylines
        </Button>

        {/* hide markers */}
        <Button onClick={() => setHideMarker(!hideMarker)}>
          {hideMarker ? 'show' : 'hide'} markers
        </Button>

        <h3 className='text-md font-semibold mb-2'>Animate Feature</h3>

        {/* disable anim marker */}
        <Button onClick={() => setAnimateMarker(!animateMarker)}>
          {animateMarker ? 'disable' : 'enable'} animate marker
        </Button>

        {/* disable anim polylines */}
        <Button onClick={() => {
          animatePolylineRef.current = !animatePolyline
          setAnimatePolyline(!animatePolyline)
        }}>
          {animatePolyline ? 'disable' : 'enable'} animate polylines
        </Button>
      </div>

      <MapContainer
        className='h-full w-full'
        center={[-8.793436, 115.215772]}
        zoom={14}
        scrollWheelZoom={true}
        whenReady={(event) => setMapContext(event.target)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
          subdomains={['mt0','mt1','mt2','mt3']}
        />

        {/* comment this component if dont use cluster */}
        <Clustering
          actionAnimationWithValue={actionAnimationWithValue}
          mapContext={mapContext}
          dataMarker={dataMarker}
          currentWave={currentWave}
          hidePolylines={hidePolylines}
          hideMarker={hideMarker}
        />
      </MapContainer>
    </div>
  )
}

export default Map