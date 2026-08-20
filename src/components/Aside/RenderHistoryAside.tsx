import { AccessTime as AccessTimeIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Divider, List, ListItemButton, Paper, Typography } from "@mui/material"
import type { Dispatch, FC, SetStateAction } from "react"
import type { BousaiData } from '../../api/types'

type Props = {
    isDialog?: boolean
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    loading: boolean
    earthquakeList: BousaiData[]
    selectedId: string | null
    setSelectedId: Dispatch<SetStateAction<string | null>>
    getScaleColor: (scale: number | null | undefined) => string
    getScaleString: (scale: number | null | undefined) => string
    setHistoryOpen: Dispatch<SetStateAction<boolean>>
}

const RenderHistoryAside: FC<Props> = (props) => {
    const {isDialog = false, limit, setLimit, loading, earthquakeList, selectedId, setSelectedId, getScaleColor, getScaleString, setHistoryOpen} = props

    return (
        <Paper elevation={isDialog ? 0 : 2} sx={{ borderRadius: isDialog ? 0 : 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#334155', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            地震履歴
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
                size="small"
                variant={limit === 15 ? "contained" : "text"}
                sx={{ color: limit === 15 ? 'white' : '#cbd5e1', bgcolor: limit === 15 ? '#475569' : 'transparent', minWidth: 40 }}
                onClick={() => setLimit(15)}
            >
                15件
            </Button>
            <Button
                size="small"
                variant={limit === 30 ? "contained" : "text"}
                sx={{ color: limit === 30 ? 'white' : '#cbd5e1', bgcolor: limit === 30 ? '#475569' : 'transparent', minWidth: 40 }}
                onClick={() => setLimit(30)}
            >
                30件
            </Button>
            </Box>
        </Box>

        {loading && earthquakeList.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
            <CircularProgress />
            </Box>
        ) : earthquakeList.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">地震情報が見つかりません</Typography>
            </Box>
        ) : (
            <List sx={{ p: 0, maxHeight: isDialog ? '60vh' : 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {earthquakeList.map((data, index) => {
                const eq = data.earthquake
                const isSelected = selectedId === data._id.$oid || (!selectedId && index === 0)
                const scaleColor = getScaleColor(eq?.maxScale)

                return (
                <div key={data._id.$oid}>
                    {index > 0 && <Divider />}
                    <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                        setSelectedId(data._id.$oid)
                        if (isDialog) {
                        setHistoryOpen(false)
                        }
                    }}
                    sx={{
                        py: 2,
                        px: 3,
                        borderLeft: isSelected ? `6px solid ${scaleColor}` : '6px solid transparent',
                        '&.Mui-selected': {
                        bgcolor: 'rgba(30, 41, 59, 0.08)',
                        '&:hover': {
                            bgcolor: 'rgba(30, 41, 59, 0.12)',
                        }
                        }
                    }}
                    >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {/* 震度サークル */}
                        <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: scaleColor,
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mr: 2,
                            flexShrink: 0,
                            boxShadow: 1
                        }}
                        >
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                            震度
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.1 }}>
                            {getScaleString(eq?.maxScale)}
                        </Typography>
                        </Box>

                        {/* 震源地・時間情報 */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {eq?.hypocenter?.name || '震源情報なし'}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5, gap: 0.2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                            {eq?.time || data.time}
                            </Typography>
                            {eq?.domesticTsunami && eq.domesticTsunami !== 'None' && (
                            <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
                                津波情報あり
                            </Typography>
                            )}
                        </Box>
                        </Box>
                    </Box>
                    </ListItemButton>
                </div>
                )
            })}
            </List>
        )}
        </Paper>
    )
}

export default RenderHistoryAside