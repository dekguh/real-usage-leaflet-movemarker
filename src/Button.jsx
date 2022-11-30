/* eslint-disable react/prop-types */
import React from 'react'

const Button = (props) => {
  return (
    <button
      className='text-sm text-white bg-blue-500 py-2 px-4 w-full'
      onClick={props?.onClick}
    >
      {props?.children}
    </button>
  )
}

export default Button