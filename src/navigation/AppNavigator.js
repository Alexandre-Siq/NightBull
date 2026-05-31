import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BriefcaseBusiness, ChartNoAxesColumn, Newspaper, Repeat2 } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { TradeScreen } from '../screens/TradeScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const tabIcon = (Icon) =>
  function IconRenderer({ color, focused }) {
    return <Icon color={color} size={20} strokeWidth={focused ? 2.2 : 1.6} />;
  };

export const AppNavigator = ({ currentUser, onSignOut }) => (
  <Tab.Navigator
    detachInactiveScreens={false}
    screenOptions={{
      animation: 'shift',
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: colors.foreground,
      tabBarInactiveTintColor: colors.mutedForeground,
      tabBarShowLabel: false,
      tabBarIconStyle: {
        marginTop: 0,
      },
      tabBarStyle: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: 22,
        borderTopWidth: 1,
        bottom: 18,
        height: 66,
        left: 18,
        overflow: 'visible',
        paddingBottom: 0,
        paddingTop: 0,
        position: 'absolute',
        right: 18,
      },
      tabBarItemStyle: {
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }}
  >
    <Tab.Screen name="Home" options={{ title: 'Carteira', tabBarIcon: tabIcon(BriefcaseBusiness) }}>
      {() => <HomeScreen currentUser={currentUser} onSignOut={onSignOut} />}
    </Tab.Screen>
    <Tab.Screen name="Trade" options={{ title: 'Operar', tabBarIcon: tabIcon(Repeat2) }}>
      {() => <TradeScreen currentUser={currentUser} />}
    </Tab.Screen>
    <Tab.Screen name="Reports" options={{ title: 'Relatórios', tabBarIcon: tabIcon(ChartNoAxesColumn) }}>
      {() => <ReportsScreen currentUser={currentUser} />}
    </Tab.Screen>
    <Tab.Screen name="News" options={{ title: 'Notícias', tabBarIcon: tabIcon(Newspaper) }}>
      {() => <NewsScreen currentUser={currentUser} />}
    </Tab.Screen>
  </Tab.Navigator>
);
