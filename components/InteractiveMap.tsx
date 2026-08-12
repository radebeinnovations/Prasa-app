import { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Point = { x: number; y: number };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const distance = (first: Point, second: Point) => Math.hypot(second.x - first.x, second.y - first.y);
const midpoint = (first: Point, second: Point): Point => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
const mapSource = require('../assets/route-map.png');
const mapAsset = Image.resolveAssetSource(mapSource);

const constrainOffset = (next: Point, nextScale: number, viewport: Point): Point => {
  if (!viewport.x || !viewport.y || !mapAsset.width || !mapAsset.height) return next;
  const coverScale = Math.max(viewport.x / mapAsset.width, viewport.y / mapAsset.height);
  const renderedWidth = mapAsset.width * coverScale * nextScale;
  const renderedHeight = mapAsset.height * coverScale * nextScale;
  const maximumX = Math.max(0, (renderedWidth - viewport.x) / 2);
  const maximumY = Math.max(0, (renderedHeight - viewport.y) / 2);
  return {
    x: clamp(next.x, -maximumX, maximumX),
    y: clamp(next.y, -maximumY, maximumY),
  };
};

export function InteractiveMap() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  const viewportRef = useRef<Point>({ x: 0, y: 0 });
  const gestureStart = useRef({ scale: 1, offset: { x: 0, y: 0 }, distance: 0, center: { x: 0, y: 0 } });

  const updateOffset = (next: Point, nextScale = scaleRef.current) => {
    const constrained = constrainOffset(next, nextScale, viewportRef.current);
    offsetRef.current = constrained;
    setOffset(constrained);
  };

  const setZoom = (nextScale: number) => {
    const clampedScale = clamp(nextScale, 0.75, 6);
    scaleRef.current = clampedScale;
    setScale(clampedScale);
    updateOffset(offsetRef.current, clampedScale);
  };

  const reset = () => {
    scaleRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  const webGestureStyle = Platform.OS === 'web' ? ({ touchAction: 'none' } as never) : undefined;

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (event) => event.nativeEvent.touches.length > 1,
    onMoveShouldSetPanResponder: (_, state) => Math.abs(state.dx) > 2 || Math.abs(state.dy) > 2 || state.numberActiveTouches > 1,
    onPanResponderGrant: (event) => {
      const touches = event.nativeEvent.touches;
      const first = touches[0] ?? { pageX: 0, pageY: 0 };
      const second = touches[1];
      const center = second ? midpoint({ x: first.pageX, y: first.pageY }, { x: second.pageX, y: second.pageY }) : { x: first.pageX, y: first.pageY };
      gestureStart.current = {
        scale: scaleRef.current,
        offset: offsetRef.current,
        distance: second ? distance({ x: first.pageX, y: first.pageY }, { x: second.pageX, y: second.pageY }) : 0,
        center,
      };
    },
    onPanResponderMove: (event, state) => {
      const touches = event.nativeEvent.touches;
      if (touches.length > 1) {
        const first = { x: touches[0].pageX, y: touches[0].pageY };
        const second = { x: touches[1].pageX, y: touches[1].pageY };
        const currentDistance = distance(first, second);
        const currentCenter = midpoint(first, second);
        const nextScale = clamp(gestureStart.current.scale * (currentDistance / Math.max(gestureStart.current.distance, 1)), 0.75, 6);
        scaleRef.current = nextScale;
        setScale(nextScale);
        updateOffset({
          x: gestureStart.current.offset.x + currentCenter.x - gestureStart.current.center.x,
          y: gestureStart.current.offset.y + currentCenter.y - gestureStart.current.center.y,
        }, nextScale);
        return;
      }
      updateOffset({ x: gestureStart.current.offset.x + state.dx, y: gestureStart.current.offset.y + state.dy });
    },
    onPanResponderTerminationRequest: () => false,
  }), []);

  return (
    <View
      accessibilityHint="Pinch to zoom and drag to move around the route"
      onLayout={(event) => {
        viewportRef.current = { x: event.nativeEvent.layout.width, y: event.nativeEvent.layout.height };
        updateOffset(offsetRef.current);
      }}
      style={[styles.container, webGestureStyle]}
      {...panResponder.panHandlers}
    >
      <View pointerEvents="none" style={[styles.mapLayer, { transform: [{ translateX: offset.x }, { translateY: offset.y }] }]}>
        <Image resizeMode="cover" source={mapSource} style={[styles.map, { transform: [{ scale }] }]} />
      </View>
      <View pointerEvents="box-none" style={styles.helpWrap}>
        <View style={styles.helpPill}><Ionicons name="hand-left-outline" size={15} color="#36505D" /><Text style={styles.helpText}>Drag · pinch or use + / −</Text></View>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity accessibilityLabel="Zoom out" onPress={() => setZoom(scale - 0.35)} style={styles.controlButton}><Ionicons name="remove" size={22} color="#0785C5" /></TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Reset map" onPress={reset} style={styles.controlButton}><Ionicons name="locate-outline" size={19} color="#0785C5" /></TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Zoom in" onPress={() => setZoom(scale + 0.35)} style={styles.controlButton}><Ionicons name="add" size={22} color="#0785C5" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#EAF1E5' },
  mapLayer: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  helpWrap: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' },
  helpPill: { minHeight: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpText: { color: '#36505D', fontSize: 12, fontWeight: '600' },
  controls: { position: 'absolute', right: 14, top: 112, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.94)', overflow: 'hidden', elevation: 3, shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 5 },
  controlButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D7E0E4' },
});
