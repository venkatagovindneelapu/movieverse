import { Tabs } from 'expo-router';
import { Chrome as Home, Search, Heart, User, TrendingUp } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Trending',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'My List',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    height: 88,
    // Removed all borders for seamless design
    borderWidth: 0,
    // Seamless blending with background
    marginTop: 0,
    marginBottom: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'System',
    marginTop: 4,
    textAlign: 'center',
    // Perfect text alignment
    lineHeight: 14,
  },
  tabBarItem: {
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    // Remove any default borders
    borderWidth: 0,
    // Perfect centering
    flex: 1,
  },
});