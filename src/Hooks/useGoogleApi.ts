import { GoogleGenAI } from "@google/genai"
import { useCallback, useContext, useState } from "react"
import RootContext from "../contexts/RootContext"
import type { GeminiInteractionResult, ShityosonText } from "../api/types"

const useGoogleApi = () => {
    const {GOOGLE_API_KEY} = useContext(RootContext)

    const [loading, setLoading] = useState(false)
    const [interactionResult, setInteractionResult] = useState<GeminiInteractionResult | null>(null)
    const ai = new GoogleGenAI({apiKey: GOOGLE_API_KEY})

    const setInteraction = useCallback(async (shityoson: ShityosonText | null) => {
        if (!shityoson) return

        console.log("=== [START] Gemini AI Interaction ===")
        console.log("=== send >> https://generativelanguage.googleapis.com/v1beta/interactions ===")
        setLoading(true)

        const prompt = shityoson 
            ? `${shityoson.pref}${shityoson.munic}の震災時ハザードエリアと避難所、付近を走る現在の鉄道路線状況等を知りたい` 
            : ""

        try {
            const result = await ai.interactions.create({
                model: "gemini-3.6-flash",
                input: prompt
            })
            const typedResult = result as unknown as GeminiInteractionResult
            setInteractionResult(typedResult)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
            console.log("=== [END] Stop Gemini AI Interaction ===")
        }
    }, [])


    return {
        loading,
        interactionResult,
        setInteraction
    }
}

export default useGoogleApi
