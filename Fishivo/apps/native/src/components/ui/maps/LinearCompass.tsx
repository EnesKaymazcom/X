import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, useWindowDimensions, Platform, Text } from 'react-native'
import Svg, { Line, Rect, Text as SvgText, G } from 'react-native-svg'
import { useTheme } from '@/contexts/ThemeContext'
import { useLocationStore } from '@/stores/locationStore'
import CompassHeading, { type CompassHeadingData } from 'react-native-compass-heading'
import { formatDegrees, mpsToKnots } from '@fishivo/utils'
import { StyleSheet } from 'react-native'
// remove: import { CONVERSION_FACTORS } from '@fishivo/types'

interface LinearCompassProps {
  visible: boolean
  height?: number
  cog?: number | null
}

const clampHeading = (h: number): number => {
  const n = ((h % 360) + 360) % 360
  return Number.isFinite(n) ? n : 0
}

const shortestDelta = (fromDeg: number, toDeg: number): number => {
  let d = clampHeading(toDeg) - clampHeading(fromDeg)
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

const useAnimatedHeading = (initial: number) => {
  const initialClamped = clampHeading(initial)
  const [value, setValue] = useState<number>(initialClamped)
  const valueRef = useRef<number>(initialClamped)
  const targetRef = useRef<number>(initialClamped)
  const frameRef = useRef<number | null>(null)

  const animate = useCallback(() => {
    frameRef.current = null
    const current = valueRef.current
    const target = targetRef.current
    const delta = shortestDelta(current, target)

    const step = Math.max(Math.min(Math.abs(delta) * 0.2, 4), 0.5) * Math.sign(delta)
    const next = clampHeading(current + step)

    if (Math.abs(shortestDelta(next, target)) < 0.5) {
      const snapped = clampHeading(target)
      valueRef.current = snapped
      setValue(snapped)
      return
    }

    valueRef.current = next
    setValue(next)
    frameRef.current = requestAnimationFrame(animate)
  }, [])

  const setTarget = useCallback((deg: number) => {
    const clamped = clampHeading(deg)
    targetRef.current = clamped
    if (frameRef.current == null) {
      frameRef.current = requestAnimationFrame(animate)
    }
  }, [animate])

  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return { value, setTarget }
}

const getLabelForDegree = (deg: number): string => {
  const d = clampHeading(deg)
  if (d === 0) return 'N'
  if (d === 90) return 'E'
  if (d === 180) return 'S'
  if (d === 270) return 'W'
  return String(d)
}

const LinearCompass: React.FC<LinearCompassProps> = ({ visible, height = 44, cog = null }) => {
  const { width } = useWindowDimensions()
  const { theme } = useTheme()
  const gpsHeading = useLocationStore(s => s.currentLocation?.heading ?? null)
  const speedMps = useLocationStore(s => s.currentLocation?.speed ?? null)
  // removed altitude usage

  const { value: heading, setTarget } = useAnimatedHeading(0)

  useEffect(() => {
    let isActive = true
    let rafId: number | null = null

    if (!visible) {
      try { CompassHeading.stop() } catch {}
      return
    }

    const update = (data: CompassHeadingData) => {
      if (!isActive) return
      const next = clampHeading(data.heading)
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setTarget(next))
    }

    const start = () => {
      try {
        const rate = Platform.select({ android: 6, ios: 3, default: 5 }) as number
        CompassHeading.start(rate, update)
      } catch {
        if (gpsHeading != null) setTarget(gpsHeading)
        else if (cog != null && Number.isFinite(cog)) setTarget(cog)
      }
    }

    start()

    return () => {
      isActive = false
      if (rafId != null) cancelAnimationFrame(rafId)
      try { CompassHeading.stop() } catch {}
    }
  }, [visible, gpsHeading, setTarget, cog])

  useEffect(() => {
    if (!visible) return
    if (gpsHeading != null) setTarget(gpsHeading)
  }, [gpsHeading, setTarget, visible])

  useEffect(() => {
    if (!visible) return
    if (cog != null && Number.isFinite(cog)) setTarget(cog)
  }, [cog, setTarget, visible])

  const H = Math.max(36, Math.min(64, height))
  const midX = width / 2
  const pxPerDeg = width / 180

  const baseDeg = Math.round(heading / 5) * 5

  const ticks = useMemo(() => {
    const items: Array<{ x: number; deg: number; isMajor: boolean; isCardinal: boolean }> = []
    for (let offset = -200; offset <= 200; offset += 5) {
      const deg = clampHeading(baseDeg + offset)
      const diff = shortestDelta(heading, deg)
      const x = midX + diff * pxPerDeg
      if (x < -20 || x > width + 20) continue
      const isMajor = deg % 10 === 0
      const isCardinal = deg % 90 === 0
      items.push({ x, deg, isMajor, isCardinal })
    }
    return items
  }, [heading, midX, pxPerDeg, width, baseDeg])

  if (!visible) return null

  const bgColor = 'rgba(0, 0, 0, 0)'
  const tickColor = 'rgba(255, 255, 255, 0.9)'
  const labelColor = 'rgba(255, 255, 255, 0.95)'
  const pointerColor = theme.colors.primary
  const northColor = '#ff3b30'

  const cogText = cog != null && Number.isFinite(cog) ? `COG ${formatDegrees(cog)}` : null
  const headingText = `${Math.round(heading)}°`

  const speedKnots = speedMps != null && Number.isFinite(speedMps) ? mpsToKnots(speedMps) : 0
  const centerSpeedText = `${speedKnots.toFixed(1)} kn`

  // removed altitude conversion and ALT text

  // Compose bottom centered info line (restructured to 3 columns)
  const leftCog = cogText ?? 'COG —'
  const rightHeading = headingText
  // removed: const infoText = undefined

  return (
    <View style={styles.root}>
      <Svg width={width} height={H}>
        <Rect x={0} y={0} width={width} height={H} fill={bgColor} />
        <Line x1={0} y1={H - 1} x2={width} y2={H - 1} stroke={tickColor} strokeWidth={1} />
        <G>
          {ticks.map(({ x, deg, isMajor, isCardinal }) => {
            const tickH = isCardinal ? 23 : isMajor ? 14 : 8
            const y1 = H - 1
            const y2 = H - 1 - tickH
            const showLabel = isMajor
            const label = getLabelForDegree(deg)
            const isNorth = label === 'N'
            const fillCol = isNorth ? northColor : labelColor
            return (
              <G key={`${deg}`}>
                <Line x1={x} y1={y1} x2={x} y2={y2} stroke={tickColor} strokeWidth={isCardinal ? 2 : 1} />
                {showLabel && (
                  isCardinal ? (
                    <SvgText
                      x={x}
                      y={y2 - 6}
                      fontSize={12}
                      fontWeight={'700'}
                      fill={fillCol}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {label}
                    </SvgText>
                  ) : (
                    <SvgText
                      x={x}
                      y={y2 - 6}
                      fontSize={8}
                      fontWeight={'400'}
                      fill={labelColor}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(-90 ${x} ${y2 - 6})`}
                    >
                      {label}
                    </SvgText>
                  )
                )}
              </G>
            )
          })}
        </G>
        <G>
          <Line x1={midX} y1={0} x2={midX} y2={H} stroke={pointerColor} strokeWidth={2} />
        </G>
      </Svg>
      {/* Info line moved below SVG to avoid overlap and create extra spacing */}
      <View style={styles.infoRow}>
        <Text style={{ color: labelColor, fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'left' }} numberOfLines={1}>
          {leftCog}
        </Text>
        <Text style={{ color: labelColor, fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {centerSpeedText}
        </Text>
        <Text style={{ color: labelColor, fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right' }} numberOfLines={1}>
          {rightHeading}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { width: '100%', alignItems: 'stretch', justifyContent: 'center' },
  infoRow: { width: '100%', alignItems: 'center', paddingTop: 4, paddingBottom: 6, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
})

export default memo(LinearCompass)