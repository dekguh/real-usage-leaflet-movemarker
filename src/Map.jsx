/* eslint-disable no-unused-vars */
import React, { useState } from 'react'

// leaflet
import { MapContainer, TileLayer } from 'react-leaflet'

const Map = () => {
  const [mapContext, setMapContext] = useState('')

  return (
    <div className='h-[100vh] w-full relative'>
      {/* panel play */}
      <div className='absolute top-3 right-3 bg-white z-[9999]  p-3 rounded-md max-w-[240px] w-full'>
        tes
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
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

      </MapContainer>
    </div>
  )
}

export default Map