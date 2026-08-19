import React, { useState, useMemo } from 'react'
import { Box, Paper, Typography } from '@mui/material'

// 都道府県名（県あり）から都道府県コード（1〜47）へのマッピング
const PREFECTURE_CODES: { [key: string]: string } = {
  '北海道': '1', '青森県': '2', '岩手県': '3', '宮城県': '4', '秋田県': '5', '山形県': '6', '福島県': '7',
  '茨城県': '8', '栃木県': '9', '群馬県': '10', '埼玉県': '11', '千葉県': '12', '東京都': '13', '神奈川県': '14',
  '新潟県': '15', '富山県': '16', '石川県': '17', '福井県': '18', '山梨県': '19', '長野県': '20',
  '岐阜県': '21', '静岡県': '22', '愛知県': '23', '三重県': '24', '滋賀県': '25', '京都府': '26',
  '大阪府': '27', '兵庫県': '28', '奈良県': '29', '和歌山県': '30', '鳥取県': '31', '島根県': '32',
  '岡山県': '33', '広島県': '34', '山口県': '35', '徳島県': '36', '香川県': '37', '愛媛県': '38',
  '高知県': '39', '福岡県': '40', '佐賀県': '41', '長崎県': '42', '熊本県': '43', '大分県': '44',
  '宮崎県': '45', '鹿児島県': '46', '沖縄県': '47'
}

// コードから都道府県名（県あり）への逆引きマッピング
const CODE_TO_PREF_NAME: { [key: string]: string } = Object.fromEntries(
  Object.entries(PREFECTURE_CODES).map(([name, code]) => [code, name])
)

// 震度値から表示用文字列への変換
const getScaleString = (scale: number | null): string => {
  if (scale === null) return '観測なし'
  switch (scale) {
    case 10: return '震度 1'
    case 20: return '震度 2'
    case 30: return '震度 3'
    case 40: return '震度 4'
    case 45: return '震度 5弱'
    case 50: return '震度 5強'
    case 55: return '震度 6弱'
    case 60: return '震度 6強'
    case 70: return '震度 7'
    default: return '震度不明'
  }
}

// 震度に応じた塗りの色
const getPrefecturalColor = (scale: number | null): string => {
  if (scale === null) return '#e2e8f0' // 揺れなし（デフォルトグレー）
  switch (scale) {
    case 10: return '#10b981' // 震度1: 緑
    case 20: return '#059669' // 震度2: 深緑
    case 30: return '#f59e0b' // 震度3: 黄色・オレンジ
    case 40: return '#d97706' // 震度4: オレンジ
    case 45:
    case 50: return '#ef4444' // 震度5弱/5強: 赤
    case 55:
    case 60: return '#b91c1c' // 震度6弱/6強: 暗赤色
    case 70: return '#7f1d1d' // 震度7: 深赤色（最警戒）
    default: return '#94a3b8' // 震度不明: グレー
  }
}

interface JapanMapProps {
  observedPrefs: { pref: string; maxScale: number }[]
}

interface HoverState {
  code: string
  name: string
  scale: number | null
  x: number
  y: number
}

export const JapanMap: React.FC<JapanMapProps> = ({ observedPrefs }) => {
  const [hovered, setHovered] = useState<HoverState | null>(null)

  // 都道府県コード -> 最大震度のマッピングオブジェクトを作成
  const prefScales = useMemo(() => {
    const map: { [code: string]: number } = {}
    observedPrefs.forEach((item) => {
      const code = PREFECTURE_CODES[item.pref]
      if (code) {
        map[code] = item.maxScale
      }
    })
    return map
  }, [observedPrefs])

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, code: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // SVG座標系内のマウス位置を算出
    const x = e.clientX - rect.left + 15
    const y = e.clientY - rect.top - 10
    const name = CODE_TO_PREF_NAME[code] || '不明'
    const scale = prefScales[code] !== undefined ? prefScales[code] : null

    setHovered({ code, name, scale, x, y })
  }

  const handleMouseLeave = () => {
    setHovered(null)
  }

  const renderPrefecture = (code: string, pathD: string, originalClass: string, isGroup = false) => {
    const scale = prefScales[code] !== undefined ? prefScales[code] : null
    const fillColor = getPrefecturalColor(scale)
    const isObserved = scale !== null

    const commonProps = {
      d: pathD,
      fill: fillColor,
      stroke: isObserved ? '#ffffff' : '#94a3b8',
      strokeWidth: isObserved ? '2' : '1',
      style: {
        transition: 'fill 0.3s ease, stroke 0.3s ease',
        cursor: 'pointer',
      },
      onMouseMove: (e: React.MouseEvent<SVGElement>) => handleMouseMove(e, code),
      onMouseLeave: handleMouseLeave,
    }

    if (isGroup) {
      return (
        <g
          key={code}
          className={`${originalClass} prefecture-tile`}
          style={{ outline: 'none' }}
        >
          <path {...commonProps} />
        </g>
      )
    }

    return (
      <path
        key={code}
        className={`${originalClass} prefecture-tile`}
        {...commonProps}
      />
    )
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e2e8f0' }}>
      <svg
        viewBox="0 0 1000 1000"
        style={{
          width: '100%',
          maxHeight: '450px',
          height: 'auto',
          filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.05))'
        }}
      >
        <g className="svg-map">
          <g className="prefectures">
            {/* 47 沖縄 (グループ構造) */}
            {renderPrefecture('47', 'M144.9,456.4c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H144.9z', 'okinawa kyushu-okinawa prefecture', true)}

            {/* 46 鹿児島 */}
            {renderPrefecture('46', 'M99.3,912.7c-4.4,0-8,3.6-8,8V992c0,4.4,3.6,8,8,8h116.8c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H99.3z', 'kagoshima kyushu kyushu-okinawa prefecture')}

            {/* 45 宮崎 */}
            {renderPrefecture('45', 'M167.8,821.5c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H167.8z', 'miyazaki kyushu kyushu-okinawa prefecture')}

            {/* 44 大分 */}
            {renderPrefecture('44', 'M167.8,730.2c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H167.8z', 'oita kyushu kyushu-okinawa prefecture')}

            {/* 43 熊本 */}
            {renderPrefecture('43', 'M99.3,730.2c-4.4,0-8,3.6-8,8v162.5c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8V738.2c0-4.4-3.6-8-8-8H99.3z', 'kumamoto kyushu kyushu-okinawa prefecture')}

            {/* 42 長崎 */}
            {renderPrefecture('42', 'M8,638.9c-4.4,0-8,3.6-8,8v94c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8v-94c0-4.4-3.6-8-8-8H8z', 'nagasaki kyushu kyushu-okinawa prefecture')}

            {/* 41 佐賀 */}
            {renderPrefecture('41', 'M53.7,638.9c-4.4,0-8,3.6-8,8v94c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8v-94c0-4.4-3.6-8-8-8H53.7z', 'saga kyushu kyushu-okinawa prefecture')}

            {/* 40 福岡 */}
            {renderPrefecture('40', 'M99.3,638.9c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h116.8c4.4,0,8-3.6,8-8V647c0-4.4-3.6-8-8-8H99.3z', 'fukuoka kyushu kyushu-okinawa prefecture')}

            {/* 39 高知 */}
            {renderPrefecture('39', 'M281.9,935.6c-4.4,0-8,3.6-8,8V992c0,4.4,3.6,8,8,8H353c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H281.9z', 'kochi shikoku prefecture')}

            {/* 38 愛媛 */}
            {renderPrefecture('38', 'M281.9,867.1c-4.4,0-8,3.6-8,8v48.4c0,4.4,3.6,8,8,8H353c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H281.9z', 'ehime shikoku prefecture')}

            {/* 37 香川 */}
            {renderPrefecture('37', 'M373.1,867.1c-4.4,0-8,3.6-8,8v48.4c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H373.1z', 'kagawa shikoku prefecture')}

            {/* 36 徳島 */}
            {renderPrefecture('36', 'M373.1,935.6c-4.4,0-8,3.6-8,8V992c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H373.1z', 'tokushima shikoku prefecture')}

            {/* 35 山口 */}
            {renderPrefecture('35', 'M281.9,638.9c-4.4,0-8,3.6-8,8v162.5c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8V647c0-4.4-3.6-8-8-8H281.9z', 'yamaguchi chugoku prefecture')}

            {/* 34 広島 */}
            {renderPrefecture('34', 'M327.5,730.2c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H327.5z', 'hiroshima chugoku prefecture')}

            {/* 33 岡山 */}
            {renderPrefecture('33', 'M395.9,730.2c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H395.9z', 'okayama chugoku prefecture')}

            {/* 32 島根 */}
            {renderPrefecture('32', 'M327.5,638.9c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8V647c0-4.4-3.6-8-8-8H327.5z', 'shimane chugoku prefecture')}

            {/* 31 鳥取 */}
            {renderPrefecture('31', 'M395.9,638.9c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8V647c0-4.4-3.6-8-8-8H395.9z', 'tottori chugoku prefecture')}

            {/* 30 和歌山 */}
            {renderPrefecture('30', 'M510,958.4c-4.4,0-8,3.6-8,8V992c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-25.6c0-4.4-3.6-8-8-8H510z', 'wakayama kinki prefecture')}

            {/* 29 奈良 */}
            {renderPrefecture('29', 'M555.7,775.8c-4.4,0-8,3.6-8,8v162.5c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8V783.9c0-4.4-3.6-8-8-8H555.7z', 'nara kinki prefecture')}

            {/* 28 兵庫 */}
            {renderPrefecture('28', 'M441.6,638.9c-4.4,0-8,3.6-8,8v162.5c0,4.4,3.6,8,8,8H490c4.4,0,8-3.6,8-8V647c0-4.4-3.6-8-8-8H441.6z', 'hyogo kinki prefecture')}

            {/* 27 大阪 */}
            {renderPrefecture('27', 'M510,775.8c-4.4,0-8,3.6-8,8v162.5c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8V783.9c0-4.4-3.6-8-8-8H510z', 'osaka kinki prefecture')}

            {/* 26 京都 */}
            {renderPrefecture('26', 'M510,638.9c-4.4,0-8,3.6-8,8v116.8c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8h-25.6c-6.6,0-12-5.4-12-12V647c0-4.4-3.6-8-8-8H510z', 'kyoto kinki prefecture')}

            {/* 25 滋賀 */}
            {renderPrefecture('25', 'M601.3,684.6c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H601.3z', 'shiga kinki prefecture')}

            {/* 24 三重 */}
            {renderPrefecture('24', 'M601.3,775.8c-4.4,0-8,3.6-8,8V992c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8V783.9c0-4.4-3.6-8-8-8H601.3z', 'mie kinki prefecture')}

            {/* 23 愛知 */}
            {renderPrefecture('23', 'M647,867.1c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H647z', 'aichi chubu prefecture')}

            {/* 22 静岡 */}
            {renderPrefecture('22', 'M738.2,867.1c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H738.2z', 'shizuoka chubu prefecture')}

            {/* 21 岐阜 */}
            {renderPrefecture('21', 'M647,593.3c-4.4,0-8,3.6-8,8v253.7c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8V601.3c0-4.4-3.6-8-8-8H647z', 'gifu chubu prefecture')}

            {/* 20 長野 */}
            {renderPrefecture('20', 'M715.4,593.3c-4.4,0-8,3.6-8,8v253.7c0,4.4,3.6,8,8,8H741c4.4,0,8-3.6,8-8v-71.2c0-6.6,5.4-12,12-12h2.7c4.4,0,8-3.6,8-8V601.3c0-4.4-3.6-8-8-8H715.4z', 'nagano chubu prefecture')}

            {/* 19 山梨 */}
            {renderPrefecture('19', 'M761,775.8c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H761z', 'yamanashi chubu prefecture')}

            {/* 18 福井 */}
            {renderPrefecture('18', 'M555.7,638.9c-4.4,0-8,3.6-8,8v25.6c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8h-25.6c-4.4,0-8,3.6-8,8v25.6c0,6.6-5.4,12-12,12H555.7z', 'fukui chubu prefecture')}

            {/* 17 石川 */}
            {renderPrefecture('17', 'M601.3,433.6c-4.4,0-8,3.6-8,8v139.6c0,4.4,3.6,8,8,8h25.6c4.4,0,8-3.6,8-8V441.6c0-4.4-3.6-8-8-8H601.3z', 'ishikawa chubu prefecture')}

            {/* 16 富山 */}
            {renderPrefecture('16', 'M647,502c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8V510c0-4.4-3.6-8-8-8H647z', 'toyama chubu prefecture')}

            {/* 15 新潟 */}
            {renderPrefecture('15', 'M738.2,502c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h71.2c4.4,0,8-3.6,8-8V464.4c0-4.4-3.6-8-8-8h-25.6c-4.4,0-8,3.6-8,8V490c0,6.6-5.4,12-12,12H738.2z', 'niigata chubu prefecture')}

            {/* 14 神奈川 */}
            {renderPrefecture('14', 'M829.5,867.1c-4.4,0-8,3.6-8,8v48.4c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H829.5z', 'kanagawa kanto prefecture')}

            {/* 13 東京 */}
            {renderPrefecture('13', 'M829.5,775.8c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-2.7c0-6.6,5.4-12,12-12h25.6c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H829.5z', 'tokyo kanto prefecture')}

            {/* 12 千葉 */}
            {renderPrefecture('12', 'M943.6,730.2c-4.4,0-8,3.6-8,8v208.1c0,4.4,3.6,8,8,8H992c4.4,0,8-3.6,8-8V738.2c0-4.4-3.6-8-8-8H943.6z', 'chiba kanto prefecture')}

            {/* 11 埼玉 */}
            {renderPrefecture('11', 'M783.9,684.6c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h139.6c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H783.9z', 'saitama kanto prefecture')}

            {/* 10 群馬 */}
            {renderPrefecture('10', 'M783.9,593.3c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8H848c1.5,0,3.7-3.1,3.7-8v-71.2c0-4.9-2.2-8-3.7-8H783.9z', 'gunma kanto prefecture')}

            {/* 9 栃木 */}
            {renderPrefecture('9', 'M859.4,593.3c-1.5,0-3.7,3.1-3.7,8v71.2c0,4.9,2.2,8,3.7,8h64.1c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H859.4z', 'tochigi kanto prefecture')}

            {/* 8 茨城 */}
            {renderPrefecture('8', 'M943.6,593.3c-4.4,0-8,3.6-8,8v116.8c0,4.4,3.6,8,8,8H992c4.4,0,8-3.6,8-8V601.3c0-4.4-3.6-8-8-8H943.6z', 'ibaraki kanto prefecture')}

            {/* 7 福島 */}
            {renderPrefecture('7', 'M829.5,456.4c-4.4,0-8,3.6-8,8v116.8c0,4.4,3.6,8,8,8H992c4.4,0,8-3.6,8-8V464.4c0-4.4-3.6-8-8-8H829.5z', 'fukushima tohoku prefecture')}

            {/* 6 山形 */}
            {renderPrefecture('6', 'M783.9,387.9c-4.4,0-8,3.6-8,8v48.4c0,4.4,3.6,8,8,8h94c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H783.9z', 'yamagata tohoku prefecture')}

            {/* 5 秋田 */}
            {renderPrefecture('5', 'M783.9,296.6c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h94c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H783.9z', 'akita tohoku prefecture')}

            {/* 4 宮城 */}
            {renderPrefecture('4', 'M898,387.9c-4.4,0-8,3.6-8,8v48.4c0,4.4,3.6,8,8,8h94c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H898z', 'miyagi tohoku prefecture')}

            {/* 3 岩手 */}
            {renderPrefecture('3', 'M898,296.6c-4.4,0-8,3.6-8,8v71.2c0,4.4,3.6,8,8,8h94c4.4,0,8-3.6,8-8v-71.2c0-4.4-3.6-8-8-8H898z', 'iwate tohoku prefecture')}

            {/* 2 青森 */}
            {renderPrefecture('2', 'M783.9,228.2c-4.4,0-8,3.6-8,8v48.4c0,4.4,3.6,8,8,8H992c4.4,0,8-3.6,8-8v-48.4c0-4.4-3.6-8-8-8H783.9z', 'aomori tohoku prefecture')}

            {/* 1 北海道 */}
            {renderPrefecture('1', 'M783.9,0c-4.4,0-8,3.6-8,8v185.3c0,4.4,3.6,8,8,8h48.4c4.4,0,8-3.6,8-8v-25.6c0-6.6,5.4-12,12-12H992c4.4,0,8-3.6,8-8V8c0-4.4-3.6-8-8-8H783.9z', 'hokkaido prefecture')}
          </g>
          {/* 沖縄の区切り境界線 */}
          <g className="boundary-line" stroke="#94a3b8" strokeWidth="6" strokeLinejoin="round">
            <path d="M216.1,593.3H89.3c-1.1,0-2-0.9-2-2s0.9-2,2-2h126.9c4.4,0,8-3.6,8-8V454.4c0-1.1,0.9-2,2-2s2,0.9,2,2v126.9C228.2,587.9,222.8,593.3,216.1,593.3z" fill="none" />
          </g>
        </g>
      </svg>

      {/* フローティングツールチップ */}
      {hovered && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            left: hovered.x,
            top: hovered.y,
            pointerEvents: 'none',
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            color: 'white',
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            zIndex: 10,
            transition: 'left 0.1s ease, top 0.1s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {hovered.name}
          </Typography>
          <Typography variant="caption" sx={{ color: hovered.scale !== null ? '#f8fafc' : '#94a3b8', display: 'block', mt: 0.2 }}>
            {getScaleString(hovered.scale)}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}
