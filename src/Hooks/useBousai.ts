import { useCallback, useState } from "react"
import axiosClient from "../api/axiosClient"
import type { BousaiData } from "../api/types"

const useBousai = () => {
    const [bousaiDatas, setBousaiDatas] = useState<BousaiData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getBousaiDatas = useCallback((limit: number = 10) => {
        setLoading(true)
        setError(null)
        axiosClient.get<BousaiData[]>("/human-readable?limit=" + limit)
            .then((response) => {
                setBousaiDatas(response.data)
                console.log("=== [SUCCESS] get_result: https://api.p2pquake.net/v1/human-readable?limit="+limit+" ===")
                console.log(response.data)
            })
            .catch((err) => {
                console.error(err)
                setError("防災データの取得に失敗しました。時間をおいて再度お試しください。")
            })
            .finally(() => setLoading(false))
    }, [])

    return {
        bousaiDatas,
        loading,
        error,
        getBousaiDatas
    }
}

export default useBousai