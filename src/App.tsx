import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  List,
  ListItemButton,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  TravelExplore as TravelExploreIcon,
  AccessTime as AccessTimeIcon,
  Sensors as SensorsIcon,
  Map as MapIcon,
} from '@mui/icons-material'
import useBousai from './Hooks/useBousai'
import type { ObservationPoint } from './api/types'
import { JapanMap } from './components/JapanMap'
import prefectureMap from './api/prefectureMap.json'

// 震度値をわかりやすい表記に変換する関数
const getScaleString = (scale: number | null | undefined): string => {
  if (scale === null || scale === undefined) return '不明'
  switch (scale) {
    case 10: return '1'
    case 20: return '2'
    case 30: return '3'
    case 40: return '4'
    case 45: return '5弱'
    case 50: return '5強'
    case 55: return '6弱'
    case 60: return '6強'
    case 70: return '7'
    default: return (scale / 10).toString()
  }
}

// 震度値に応じたカラーコードを返す関数
const getScaleColor = (scale: number | null | undefined): string => {
  if (scale === null || scale === undefined) return '#9e9e9e' // グレー
  if (scale < 30) return '#00897b' // 震度1, 2: 青緑
  if (scale < 45) return '#f57c00' // 震度3, 4: オレンジ
  if (scale < 55) return '#d32f2f' // 震度5弱, 5強: 赤
  return '#880e4f' // 震度6弱以上: 濃い赤紫
}

// 津波の影響情報のテキストとアラートSeverityを返す関数
const getTsunamiInfo = (tsunami: string | undefined) => {
  switch (tsunami) {
    case 'None':
      return {
        text: '津波の心配はありません。',
        severity: 'success' as const,
        icon: <CheckCircleOutlineIcon />
      }
    case 'Unknown':
      return {
        text: '津波の影響は不明です。今後の情報に注意してください。',
        severity: 'warning' as const,
        icon: <WarningAmberIcon />
      }
    case 'Checking':
      return {
        text: '津波の影響を調査中です。',
        severity: 'info' as const,
        icon: <InfoIcon />
      }
    case 'NonEffective':
      return {
        text: '若干の海面変動があるかもしれませんが、被害の心配はありません。',
        severity: 'success' as const,
        icon: <CheckCircleOutlineIcon />
      }
    case 'Watch':
      return {
        text: '津波注意報が発表されています。海岸から離れてください。',
        severity: 'warning' as const,
        icon: <WarningAmberIcon />
      }
    case 'Warning':
      return {
        text: '津波警報が発表されています。直ちに避難してください。',
        severity: 'error' as const,
        icon: <WarningAmberIcon />
      }
    default:
      return {
        text: tsunami ? `津波情報: ${tsunami}` : '津波情報はありません。',
        severity: 'info' as const,
        icon: <InfoIcon />
      }
  }
}

// 発表情報の種類をわかりやすい日本語に変換する関数
const getIssueTypeString = (type: string | undefined): string => {
  switch (type) {
    case 'ScalePrompt': return '震度速報'
    case 'Destination': return '震源に関する情報'
    case 'ScaleAndDestination': return '震度・震源に関する情報'
    case 'DetailScale': return '各地の震度に関する情報'
    case 'Foreign': return '遠地地震に関する情報'
    case 'Other': return 'その他の情報'
    default: return type || '不明'
  }
}

function App() {
  const { getBousaiDatas, loading, error, bousaiDatas } = useBousai()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const [limit, setLimit] = useState<number>(15)

  // 初回ロード
  useEffect(() => {
    getBousaiDatas(limit)
  }, [getBousaiDatas, limit])

  // 自動更新の設定（60秒ごと）
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      getBousaiDatas(limit)
    }, 60000)
    return () => clearInterval(timer)
  }, [autoRefresh, getBousaiDatas, limit])

  // 地震データのみをフィルタリング（感知情報 5610 などを除外するか、適切にフィルタ）
  const earthquakeList = useMemo(() => {
    return bousaiDatas.filter((data) => data.code === 551)
  }, [bousaiDatas])

  // 選択された地震データを取得
  const selectedData = useMemo(() => {
    if (selectedId) {
      return earthquakeList.find((data) => data._id.$oid === selectedId) || earthquakeList[0]
    }
    return earthquakeList[0]
  }, [earthquakeList, selectedId])


  // 観測地点（Points）を都道府県ごとにグループ化し、かつ震度順にソートする処理
  const groupedPoints = useMemo(() => {
    if (!selectedData || !selectedData.points) return []

    const prefectures = [
      '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
      '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
      '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
      '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府',
      '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県',
      '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県',
      '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ]

    const groups: { [pref: string]: { maxScale: number; list: ObservationPoint[] } } = {}

    selectedData.points.forEach((point) => {
      let pref = point.pref || ''
      if (!pref && point.addr) {
        const found = prefectures.find((p) => point.addr.startsWith(p))
        if (found) {
          pref = found
        } else {
          let foundPref = ''
          for (let len = 5; len >= 2; len--) {
            if (point.addr.length >= len) {
              const sub = point.addr.substring(0, len)
              const p = (prefectureMap as Record<string, string>)[sub]
              if (p) {
                foundPref = p
                break
              }
            }
          }
          pref = foundPref || 'その他'
        }
      } else if (!pref) {
        pref = 'その他'
      }

      if (!groups[pref]) {
        groups[pref] = { maxScale: 0, list: [] }
      }
      groups[pref].list.push(point)
      if (point.scale > groups[pref].maxScale) {
        groups[pref].maxScale = point.scale
      }
    })

    // 各都道府県内の観測地点を震度順にソート
    Object.keys(groups).forEach((pref) => {
      groups[pref].list.sort((a, b) => b.scale - a.scale)
    })

    // 都道府県自体を最大震度順（降順）に並べ替えて配列にする
    return Object.entries(groups)
      .map(([pref, data]) => ({ pref, ...data }))
      .sort((a, b) => b.maxScale - a.maxScale)
  }, [selectedData])

  const handleRefresh = useCallback(() => {
    getBousaiDatas(limit)
  }, [getBousaiDatas, limit])

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#1e293b', boxShadow: 3 }}>
        <Toolbar>
          <SensorsIcon sx={{ mr: 2, color: '#f43f5e' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            リアルタイム地震情報ダッシュボード
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="secondary"
              />
            }
            label={<Typography variant="body2" sx={{ color: 'white' }}>自動更新（60秒）</Typography>}
            sx={{ mr: 2 }}
          />
          <IconButton color="inherit" onClick={handleRefresh} disabled={loading} sx={{ ml: 1 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 左カラム: 地震情報履歴リスト */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
                <List sx={{ p: 0, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                  {earthquakeList.map((data, index) => {
                    const eq = data.earthquake
                    const isSelected = selectedId === data._id.$oid || (!selectedId && index === 0)
                    const scaleColor = getScaleColor(eq?.maxScale)

                    return (
                      <div key={data._id.$oid}>
                        {index > 0 && <Divider />}
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => setSelectedId(data._id.$oid)}
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
          </Grid>

          {/* 右カラム: 詳細表示 */}
          <Grid size={{ xs: 12, md: 8 }}>
            {selectedData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 地震詳細基本情報 */}
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: '#1e293b',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: getScaleColor(selectedData.earthquake?.maxScale),
                          color: 'white',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: 2
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                          最大震度
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                          {getScaleString(selectedData.earthquake?.maxScale)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {selectedData.earthquake?.hypocenter?.name || '震度速報（震源情報調査中）'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          発表元: {selectedData.issue?.source || '気象庁'} | 種類: {getIssueTypeString(selectedData.issue?.type)}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={selectedData.earthquake?.time ? `${selectedData.earthquake.time} 発生` : '時間不明'}
                      sx={{ bgcolor: '#475569', color: 'white', fontWeight: 'bold' }}
                    />
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    {/* 津波警戒アラート */}
                    {selectedData.earthquake && (
                      <Alert
                        severity={getTsunamiInfo(selectedData.earthquake.domesticTsunami).severity}
                        icon={getTsunamiInfo(selectedData.earthquake.domesticTsunami).icon}
                        sx={{ mb: 3, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem' }}
                      >
                        {getTsunamiInfo(selectedData.earthquake.domesticTsunami).text}
                      </Alert>
                    )}

                    {/* 震源情報グリッド */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>マグニチュード</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a', mt: 0.5 }}>
                            {selectedData.earthquake?.hypocenter?.magnitude ? `M${selectedData.earthquake.hypocenter.magnitude}` : '不明'}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>震源の深さ</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a', mt: 0.5 }}>
                            {selectedData.earthquake?.hypocenter?.depth || '不明'}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>緯度</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mt: 0.7 }}>
                            {selectedData.earthquake?.hypocenter?.latitude || '不明'}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>経度</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mt: 0.7 }}>
                            {selectedData.earthquake?.hypocenter?.longitude || '不明'}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* 震度分布マップ */}
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#334155', color: 'white', display: 'flex', alignItems: 'center' }}>
                    <MapIcon sx={{ mr: 1, color: '#38bdf8' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      震度分布マップ
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    {groupedPoints.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        震度分布データはありません。
                      </Typography>
                    ) : (
                      <JapanMap observedPrefs={groupedPoints} />
                    )}
                  </CardContent>
                </Card>

                {/* 各地の震度詳細情報 */}
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#475569', color: 'white', display: 'flex', alignItems: 'center' }}>
                    <TravelExploreIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      各地の震度（観測点情報）
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    {groupedPoints.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        震度観測点の情報はありません。
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {groupedPoints.map(({ pref, maxScale, list }) => (
                          <Accordion key={pref} defaultExpanded={maxScale >= 30} sx={{ border: '1px solid #e2e8f0', boxShadow: 'none', '&:before': { display: 'none' }, borderRadius: '8px !important', overflow: 'hidden' }}>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                bgcolor: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                '&.Mui-expanded': { minHeight: 48 },
                                '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center', gap: 1.5 }
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                                {pref}
                              </Typography>
                              <Chip
                                label={`最大震度 ${getScaleString(maxScale)}`}
                                size="small"
                                sx={{
                                  bgcolor: getScaleColor(maxScale),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  height: 22,
                                  fontSize: '0.75rem'
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({list.length}地点)
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 2, bgcolor: 'white' }}>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {list.map((point, pIndex) => (
                                  <Chip
                                    key={`${point.addr}-${pIndex}`}
                                    label={`${point.addr} (震度${getScaleString(point.scale)})`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderColor: getScaleColor(point.scale),
                                      color: getScaleColor(point.scale),
                                      fontWeight: '500',
                                      '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Paper elevation={2} sx={{ p: 5, textAlign: 'center', borderRadius: 3, color: 'text.secondary' }}>
                <Typography variant="h6">表示する地震情報がありません</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  左側の履歴リストから地震情報を選択するか、更新を行ってください。
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default App
