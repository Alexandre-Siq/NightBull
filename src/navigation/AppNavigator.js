import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BriefcaseBusiness, ChartNoAxesColumn, Newspaper, Repeat2 } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { TradeScreen } from '../screens/TradeScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

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
      tabBarIconStyle: {
        marginTop: 3,
      },
      tabBarLabelStyle: {
        fontFamily: fonts.bodyMedium,
        fontSize: 10,
        lineHeight: 13,
        marginBottom: 2,
        marginTop: 3,
      },
      tabBarStyle: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: 22,
        borderTopWidth: 1,
        bottom: 18,
        height: 78,
        left: 18,
        overflow: 'visible',
        paddingBottom: 14,
        paddingTop: 9,
        position: 'absolute',
        right: 18,
      },
      tabBarItemStyle: {
        borderRadius: 18,
        paddingVertical: 3,
      },
    }}
  >
    <Tab.Screen name="Home" options={{ title: 'Carteira', tabBarIcon: tabIcon(BriefcaseBusiness) }}>
      {() => <HomeScreen currentUser={currentUser} onSignOut={onSignOut} />}
    </Tab.Screen>
    <Tab.Screen
      name="Trade"
      component={TradeScreen}
      options={{ title: 'Operar', tabBarIcon: tabIcon(Repeat2) }}
    />
    <Tab.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ title: 'Relatórios', tabBarIcon: tabIcon(ChartNoAxesColumn) }}
    />
    <Tab.Screen
      name="News"
      component={NewsScreen}
      options={{ title: 'Notícias', tabBarIcon: tabIcon(Newspaper) }}
    />
  </Tab.Navigator>
);
