import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScannerScreen } from '../screens/ScannerScreen';
import { CartScreen } from '../screens/CartScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { RootStackParamList } from '../types';
import { useCartStore } from '../store/cartStore';
import { TouchableOpacity, Text } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const totalItems = useCartStore((s) => s.totalItems);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerBackTitle: 'Back',
        cardStyle: { backgroundColor: '#F8F8F8' },
      }}
    >
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={({ navigation }) => ({
          title: '🛒 GroceryScan',
          headerRight: () =>
            totalItems() > 0 ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('Cart')}
                style={{ marginRight: 16 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700' }}>
                  🛒 {totalItems()}
                </Text>
              </TouchableOpacity>
            ) : null,
        })}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'My Cart' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
};