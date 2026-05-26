import { createContext, useContext } from 'react'

export const ScrollChromeContext = createContext(true)
export const useScrollChrome = () => useContext(ScrollChromeContext)
