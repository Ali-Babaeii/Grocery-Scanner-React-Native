import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { CartItem as CartItemType } from '../types';
import { useCartStore } from '../store/cartStore';

interface Props {
  item: CartItemType;
}

export const CartItemCard: React.FC<Props> = ({ item }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  const storeColors: Record<string, string> = {
    Lidl: '#0050AA',
    Aldi: '#00529B',
    Rewe: '#CC0000',
    Unknown: '#666',
  };

  return (
    <View style={styles.card}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.image}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <View
            style={[
              styles.storeBadge,
              { backgroundColor: storeColors[item.store] },
            ]}
          >
            <Text style={styles.storeText}>{item.store}</Text>
          </View>
        </View>
        <Text style={styles.brand}>
          {item.brand} · {item.unit}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            €{(item.price * item.quantity).toFixed(2)}
          </Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => decreaseQty(item.id)}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => increaseQty(item.id)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Text style={styles.removeBtn}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  storeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  storeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  brand: { fontSize: 12, color: '#888', marginTop: 2 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: '#333' },
  qtyText: { fontSize: 15, fontWeight: '700', marginHorizontal: 8 },
  removeBtn: { fontSize: 20 },
});