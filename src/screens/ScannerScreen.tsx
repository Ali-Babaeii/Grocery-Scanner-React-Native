import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Vibration, Image, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NavigationProp } from '@react-navigation/native';
import { useCartStore } from '../store/cartStore';
import { fetchProductByBarcode, ApiProduct } from '../data/products';
import { RootStackParamList } from '../types';

interface Props {
  navigation: NavigationProp<RootStackParamList>;
}

export const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [error, setError] = useState('');
  const { addItem, totalItems } = useCartStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(400)).current;

  // Pulsing scanner frame animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const showCard = () =>
    Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();

  const hideCard = (cb?: () => void) =>
    Animated.timing(slideUp, { toValue: 400, duration: 250, useNativeDriver: true }).start(cb);

  // ✅ async + await — this was the root cause of NaN
  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanning || loading) return;
    setScanning(true);
    setLoading(true);
    setProduct(null);
    setError('');
    Vibration.vibrate(80);

    try {
      const result = await fetchProductByBarcode(data); // ✅ await the real API call
      setLoading(false);

      if (result) {
        setProduct(result);
        showCard();
      } else {
        setError('❌ Product not found in any database');
        setTimeout(() => { setError(''); setScanning(false); }, 3000);
      }
    } catch (e) {
      setLoading(false);
      setError('❌ Network error, please try again');
      setTimeout(() => { setError(''); setScanning(false); }, 3000);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.barcode,
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      price: product.price ?? 0,     
      unit: product.quantity ?? '',
      category: product.category ?? '',
      imageUrl: product.imageUrl ?? '',
      store: product.priceSource ?? '',
      nutriScore: product.nutriScore ?? '',
    });
    hideCard(() => {
      setProduct(null);
      setScanning(false);
    });
  };

  const handleDismiss = () =>
    hideCard(() => { setProduct(null); setScanning(false); });

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permCenter}>
        <Text style={styles.permEmoji}>📷</Text>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSub}>We need camera access to scan barcodes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const count = totalItems();

  return (
    <View style={styles.container}>
      {/* Live camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanning ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
        }}
      />

      {/* Dark overlay */}
      <View style={styles.overlay}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>🛒 GroceryScan</Text>
          {count > 0 && (
            <TouchableOpacity
              style={styles.cartBubble}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.cartBubbleText}>🛒 {count}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scanner corners */}
        <Animated.View style={[styles.frame, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </Animated.View>

        <Text style={styles.hint}>Point at any EAN-13 / QR barcode</Text>
        <Text style={styles.stores}>Lidl · Aldi · Rewe · Edeka · and more</Text>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4ADE80" />
            <Text style={styles.loadingText}>Looking up product…</Text>
          </View>
        )}

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Product result card — slides up from bottom */}
      {product && (
        <Animated.View style={[styles.card, { transform: [{ translateY: slideUp }] }]}>

          {/* Product image */}
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImage}>
              <Text style={{ fontSize: 52 }}>📦</Text>
            </View>
          )}

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Brand + quantity */}
          {!!product.brand && (
            <Text style={styles.productMeta}>{product.brand}</Text>
          )}
          {!!product.quantity && (
            <Text style={styles.productMeta}>{product.quantity}</Text>
          )}

          {/* Price row */}
          <View style={styles.priceRow}>
            {product.price !== null && product.price > 0 ? (
              <View>
                <Text style={styles.price}>
                  {product.currency} {product.price.toFixed(2)}
                </Text>
                {!!product.priceSource && (
                  <Text style={styles.priceMeta}>📍 {product.priceSource}</Text>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.noPrice}>Price not available</Text>
                <Text style={styles.noPriceSub}>No community price yet</Text>
              </View>
            )}

            {!!product.nutriScore && (
              <View style={[styles.nutriBadge, nutriColor(product.nutriScore)]}>
                <Text style={styles.nutriText}>Nutri-{product.nutriScore}</Text>
              </View>
            )}
          </View>

          {/* Source badge */}
          <Text style={styles.sourceBadge}>via {product.source}</Text>

          {/* Buttons */}
          <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
            <Text style={styles.addBtnText}>＋ Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
            <Text style={styles.dismissText}>Scan another</Text>
          </TouchableOpacity>

        </Animated.View>
      )}
    </View>
  );
};

// Nutri-Score badge color
const nutriColor = (grade: string) => {
  const map: Record<string, object> = {
    A: { backgroundColor: '#1E8A3E' },
    B: { backgroundColor: '#78BB1E' },
    C: { backgroundColor: '#F5C518' },
    D: { backgroundColor: '#E87D1E' },
    E: { backgroundColor: '#E63E11' },
  };
  return map[grade] ?? { backgroundColor: '#999' };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.42)', alignItems: 'center', justifyContent: 'center' },

  topBar: { position: 'absolute', top: 58, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cartBubble: { backgroundColor: '#4ADE80', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  cartBubbleText: { fontWeight: '800', fontSize: 14, color: '#000' },

  frame: { width: 240, height: 240 },
  corner: { position: 'absolute', width: 36, height: 36, borderColor: '#4ADE80', borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },

  hint: { color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 14, fontWeight: '600' },
  stores: { color: 'rgba(255,255,255,0.4)', marginTop: 6, fontSize: 12 },

  loadingBox: { position: 'absolute', bottom: 100, alignItems: 'center', gap: 12 },
  loadingText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  errorBox: { position: 'absolute', bottom: 80, backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  errorText: { color: '#FF6B6B', fontWeight: '600' },

  // Product card
  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 24 },
  productImage: { width: '100%', height: 160, borderRadius: 16, backgroundColor: '#F8F8F8', marginBottom: 14 },
  noImage: { height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F8', borderRadius: 16, marginBottom: 14 },
  productName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  productMeta: { fontSize: 13, color: '#999', marginBottom: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  price: { fontSize: 30, fontWeight: '900', color: '#1A1A1A' },
  priceMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  noPrice: { fontSize: 16, fontWeight: '700', color: '#999' },
  noPriceSub: { fontSize: 12, color: '#BBB', marginTop: 2 },
  nutriBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  nutriText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  sourceBadge: { fontSize: 11, color: '#CCC', marginBottom: 14, textAlign: 'right' },
  addBtn: { backgroundColor: '#1A1A1A', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  dismissBtn: { alignItems: 'center', paddingVertical: 8 },
  dismissText: { color: '#888', fontSize: 15 },

  // Permission screen
  permCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0F0F', padding: 32 },
  permEmoji: { fontSize: 64, marginBottom: 16 },
  permTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  permSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  permBtn: { backgroundColor: '#4ADE80', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 50 },
  permBtnText: { fontWeight: '800', fontSize: 16 },
});