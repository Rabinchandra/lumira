import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import DashboardScreen from './DashboardScreen';
import CalendarScreen from './CalendarScreen';
import EventsListScreen from './EventsListScreen';
import StudioScreen from './StudioScreen';
import EventDetailScreen from './EventDetailScreen';
import BottomNav from '../ui/BottomNav';
import TeamSheet from '../ui/TeamSheet';
import PaymentSheet from '../ui/PaymentSheet';
import NewEventSheet from '../ui/NewEventSheet';
import CrewSheet from '../ui/CrewSheet';
import DeleteSheet from '../ui/DeleteSheet';
import CallingOverlay from '../ui/CallingOverlay';
import Toast from '../ui/Toast';
import { FadeInUp } from '../ui/anim';

export type SheetType = 'team' | 'pay' | 'new' | 'crew' | 'delete' | 'call' | null;

export default function AppShell() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<SheetType>(null);
  const [callInfo, setCallInfo] = useState<{ name: string; phone: string } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const openSheet = (s: SheetType, extra?: any) => {
    if (s === 'call' && extra) setCallInfo(extra);
    setSheet(s);
  };
  const closeSheet = () => setSheet(null);

  const renderTab = () => {
    switch (state.tab) {
      case 'dashboard': return <DashboardScreen openSheet={openSheet} showToast={showToast} />;
      case 'calendar':  return <CalendarScreen openSheet={openSheet} showToast={showToast} />;
      case 'events':    return <EventsListScreen openSheet={openSheet} showToast={showToast} />;
      case 'studio':    return <StudioScreen openSheet={openSheet} showToast={showToast} />;
      default:          return <DashboardScreen openSheet={openSheet} showToast={showToast} />;
    }
  };

  const inDetail = !!state.openEventId;

  return (
    <View style={[styles.root, { paddingBottom: 0 }]}>
      {inDetail ? (
        <FadeInUp key="detail" distance={0} duration={340} style={{ flex: 1 }}>
          <EventDetailScreen openSheet={openSheet} showToast={showToast} />
        </FadeInUp>
      ) : (
        <FadeInUp key={state.tab} distance={10} duration={360} style={{ flex: 1 }}>
          {renderTab()}
        </FadeInUp>
      )}

      {!inDetail && (
        <BottomNav openNewSheet={() => openSheet('new')} />
      )}

      {/* Sheets */}
      {sheet === 'team'   && <TeamSheet onClose={closeSheet} showToast={showToast} />}
      {sheet === 'pay'    && <PaymentSheet onClose={closeSheet} showToast={showToast} />}
      {sheet === 'new'    && <NewEventSheet onClose={closeSheet} showToast={showToast} />}
      {sheet === 'crew'   && <CrewSheet onClose={closeSheet} showToast={showToast} />}
      {sheet === 'delete' && <DeleteSheet onClose={closeSheet} showToast={showToast} />}
      {sheet === 'call'   && callInfo && (
        <CallingOverlay name={callInfo.name} phone={callInfo.phone} onEnd={closeSheet} />
      )}

      {!!toast && <Toast message={toast} bottomOffset={inDetail ? 20 : 96} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F5FB' },
});
