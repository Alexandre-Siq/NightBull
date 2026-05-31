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

export const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      animation: 'fade',
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: colors.foreground,
      tabBarInactiveTintColor: colors.mutedForeground,
      tabBarLabelStyle: {
        fontFamily: fonts.bodyMedium,
        fontSize: 10,
        marginTop: 2,
      },
      tabBarStyle: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: 22,
        borderTopWidth: 1,
        bottom: 18,
        height: 68,
        left: 18,
        paddingBottom: 10,
        paddingTop: 10,
        position: 'absolute',
        right: 18,
      },
      tabBarItemStyle: {
        borderRadius: 18,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Carteira', tabBarIcon: tabIcon(BriefcaseBusiness) }}
    />
    <Tab.Screen
      name="Trade"
      component={TradeScreen}
      options={{ title: 'Operar', tabBarIcon: tabIcon(Repeat2) }}
    />
    <Tab.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ title: 'Relatorios', tabBarIcon: tabIcon(ChartNoAxesColumn) }}
    />
    <Tab.Screen
      name="News"
      component={NewsScreen}
      options={{ title: 'Noticias', tabBarIcon: tabIcon(Newspaper) }}
    />
  </Tab.Navigator>
);
