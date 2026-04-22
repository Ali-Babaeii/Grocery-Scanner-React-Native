import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useCartStore } from '../store/cartStore';
import { RootStackParamList } from '../types';

interface Props {
  navigation: NavigationProp<RootStackParamList>;
}

type PaymentMethod = 'card' | 'paypal' | 'apple';

export const PaymentScreen: React.FC<Props> = ({ navigation }) => {
  const { items, totalPrice, clearCart } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCard = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    return digits;
  };

  const handlePay = () => {
    if (selectedMethod === 'card') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        Alert.alert('Missing Details', 'Please fill in all card details.');
        return;
      }
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        '✅ Payment Successful!',
        `€${totalPrice().toFixed(2)} charged successfully.`,
        [
          {
            text: 'Done',
            onPress: () => {
              clearCart();
              navigation.navigate('Scanner');
            },
          },
        ]
      );
    }, 2000);
  };

  const methods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'apple', label: 'Apple / Google Pay', icon: '📱' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text style={styles.pageTitle}>Checkout</Text>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.orderRow}>
            <Text style={styles.orderItem}>
              {item.image} {item.name} × {item.quantity}
            </Text>
            <Text style={styles.orderPrice}>
              €{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.orderRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{totalPrice().toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {methods.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.methodCard,
              selectedMethod === m.id && styles.methodCardSelected,
            ]}
            onPress={() => setSelectedMethod(m.id)}
          >
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <Text
              style={[
                styles.methodLabel,
                selectedMethod === m.id && styles.methodLabelSelected,
              ]}
            >
              {m.label}
            </Text>
            <View
              style={[
                styles.radio,
                selectedMethod === m.id && styles.radioSelected,
              ]}
            >
              {selectedMethod === m.id && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Form */}
      {selectedMethod === 'card' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            placeholderTextColor="#AAA"
            value={cardNumber}
            onChangeText={(t) => setCardNumber(formatCard(t))}
            keyboardType="numeric"
            maxLength={19}
          />
          <TextInput
            style={styles.input}
            placeholder="Cardholder Name"
            placeholderTextColor="#AAA"
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="words"
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="MM/YY"
              placeholderTextColor="#AAA"
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              keyboardType="numeric"
              maxLength={5}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="CVV"
              placeholderTextColor="#AAA"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>
      )}

      {selectedMethod === 'paypal' && (
        <View style={styles.section}>
          <Text style={styles.altPayNote}>
            You'll be redirected to PayPal to complete payment.
          </Text>
        </View>
      )}

      {selectedMethod === 'apple' && (
        <View style={styles.section}>
          <Text style={styles.altPayNote}>
            Use Face ID / Touch ID to authenticate and pay.
          </Text>
        </View>
      )}

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payBtn, processing && styles.payBtnDisabled]}
        onPress={handlePay}
        disabled={processing}
      >
        <Text style={styles.payBtnText}>
          {processing ? '⏳ Processing...' : `Pay €${totalPrice().toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItem: { fontSize: 14, color: '#333', flex: 1 },
  orderPrice: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#EEE',
    marginBottom: 10,
  },
  methodCardSelected: {
    borderColor: '#1A1A1A',
    backgroundColor: '#F5F5F5',
  },
  methodIcon: { fontSize: 22, marginRight: 12 },
  methodLabel: { flex: 1, fontSize: 15, color: '#555', fontWeight: '500' },
  methodLabelSelected: { color: '#1A1A1A', fontWeight: '700' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#1A1A1A' },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A1A1A',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  row: { flexDirection: 'row' },
  altPayNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
  payBtn: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  payBtnDisabled: { backgroundColor: '#888' },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});