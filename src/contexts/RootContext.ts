import { createContext } from "react"

type ContextType = {
    GOOGLE_API_KEY: string
}

const RootContext = createContext({} as ContextType)

export default RootContext