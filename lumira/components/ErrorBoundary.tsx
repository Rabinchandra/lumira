import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  DevSettings,
} from 'react-native';
import { COLORS, ACCENT } from '../constants/colors';

// RN exposes a global error hook. It isn't in the RN types, so describe the bit we use.
type GlobalErrorUtils = {
  getGlobalHandler?: () => (error: any, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: any, isFatal?: boolean) => void) => void;
};

const ErrorUtils: GlobalErrorUtils | undefined = (globalThis as any).ErrorUtils;

type CrashSource = 'render' | 'uncaught' | 'unhandledRejection';

type Props = { children: React.ReactNode };

type State = {
  error: Error | null;
  source: CrashSource | null;
};

function toError(value: any): Error {
  if (value instanceof Error) return value;
  try {
    return new Error(typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    return new Error('Unknown error');
  }
}

/**
 * Catches everything that would otherwise crash the JS app and shows a
 * readable alert UI with the reason instead of the red screen / hard crash:
 *   - React render/lifecycle errors  -> componentDidCatch / getDerivedStateFromError
 *   - Uncaught JS exceptions         -> ErrorUtils.setGlobalHandler
 *   - Unhandled promise rejections   -> rejection-tracking onUnhandled
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  private defaultGlobalHandler?: (error: any, isFatal?: boolean) => void;

  state: State = { error: null, source: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error: toError(error), source: 'render' };
  }

  componentDidMount() {
    this.installGlobalHandlers();
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Keep the stack visible to Metro / crash reporting even though we swallow it.
    console.error('[ErrorBoundary] render error:', error, info?.componentStack);
  }

  private installGlobalHandlers() {
    // 1) Uncaught synchronous / async JS exceptions.
    if (ErrorUtils) {
      this.defaultGlobalHandler = ErrorUtils.getGlobalHandler?.();
      ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
        console.error('[ErrorBoundary] uncaught exception (fatal:', !!isFatal, '):', error);
        // Only take over the screen for fatal errors; let RN log the rest as warnings.
        if (isFatal) {
          this.showCrash(toError(error), 'uncaught');
        } else {
          this.defaultGlobalHandler?.(error, isFatal);
        }
      });
    }

    // 2) Unhandled promise rejections.
    try {
      const tracking = require('promise/setimmediate/rejection-tracking');
      tracking.enable({
        allRejections: true,
        onUnhandled: (id: number, error: any) => {
          console.error('[ErrorBoundary] unhandled promise rejection:', error);
          this.showCrash(toError(error), 'unhandledRejection');
        },
        onHandled: () => {},
      });
    } catch {
      // Rejection tracking unavailable on this platform — safe to skip.
    }
  }

  private showCrash(error: Error, source: CrashSource) {
    // Don't clobber an error that's already on screen.
    this.setState((prev) => (prev.error ? prev : { error, source }));
  }

  private reset = () => {
    this.setState({ error: null, source: null });
  };

  private reload = () => {
    if (__DEV__ && typeof DevSettings?.reload === 'function') {
      DevSettings.reload();
    } else {
      // No expo-updates in this project, so best effort in production is to
      // tear down the error and re-mount the tree.
      this.reset();
    }
  };

  render() {
    const { error, source } = this.state;
    if (!error) return this.props.children;

    const reason = error.message?.trim() || 'An unexpected error occurred.';
    const title =
      source === 'unhandledRejection'
        ? 'Unhandled error'
        : source === 'render'
        ? 'Something broke on screen'
        : 'Something went wrong';

    return (
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>!</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            The app hit an error and was stopped before it could crash. You can try again below.
          </Text>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Reason</Text>
            <ScrollView style={styles.reasonScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.reasonText}>{reason}</Text>
              {__DEV__ && !!error.stack && (
                <Text style={styles.stackText}>{error.stack}</Text>
              )}
            </ScrollView>
          </View>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={this.reset}
          >
            <Text style={styles.primaryBtnText}>Try again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={this.reload}
          >
            <Text style={styles.secondaryBtnText}>{__DEV__ ? 'Reload app' : 'Restart'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.darkBg2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) + 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 12,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  badgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: ACCENT.ink,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 21,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  reasonBox: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  reasonLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  reasonScroll: {
    maxHeight: 180,
  },
  reasonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.red,
  },
  stackText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: ACCENT.solid,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    color: '#fff',
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
