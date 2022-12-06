import React from 'react'
import L from 'leaflet'
import * as ReactDOMServer from 'react-dom/server'

export default () => {
  return L.divIcon({
    className: 'icon--marker-custom',
    html: ReactDOMServer.renderToString(
      <div
        className='flex items-center transform -translate-x-2/4 -translate-y-2/4'
        style={{ width: 'fit-content' }}
      >
        <div className='h-[40px] w-[40px] rounded-full bg-green-500 border-[3px] border-white'></div>
      </div>
    )
  })
}