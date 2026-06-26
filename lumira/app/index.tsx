import { useApp } from '../context/AppContext';
import SignInScreen from '../components/screens/SignInScreen';
import OnboardScreen from '../components/screens/OnboardScreen';
import CreateStudioScreen from '../components/screens/CreateStudioScreen';
import JoinStudioScreen from '../components/screens/JoinStudioScreen';
import AppShell from '../components/screens/AppShell';

export default function Index() {
  const { state } = useApp();

  switch (state.screen) {
    case 'signin':   return <SignInScreen />;
    case 'onboard':  return <OnboardScreen />;
    case 'create':   return <CreateStudioScreen />;
    case 'join':     return <JoinStudioScreen />;
    case 'app':      return <AppShell />;
    default:         return <SignInScreen />;
  }
}
