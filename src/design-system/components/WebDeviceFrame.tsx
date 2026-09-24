import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  useWindowDimensions,
} from 'react-native';
import { radii } from '../tokens';

interface WebDeviceFrameProps {
  children: React.ReactNode;
}

export const WebDeviceFrame: React.FC<WebDeviceFrameProps> = ({ children }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = isWeb && windowWidth > 500;

  if (!isLargeScreen) {
    return <View style={styles.nativeContainer}>{children}</View>;
  }

  return (
    <View style={styles.outerDesktopWrapper}>
      {/* Subtle branding and watermark in background */}
      <View style={styles.backgroundDetails} pointerEvents="none">
        <View style={styles.bgGlowOrb} />
        <View style={styles.brandTag}>
          <Text style={styles.brandTagTitle}>PROJECT LIGHT</Text>
          <Text style={styles.brandTagSub}>India-First Relationship Formation • Mobile Preview</Text>
        </View>
      </View>

      {/* Realistic Mobile Device Frame */}
      <View style={[styles.deviceShell, { maxHeight: Math.min(890, windowHeight - 40) }]}>
        {/* Outer Titanium / Matte Dark Bezel */}
        <View style={styles.bezelBorder}>
          {/* Top Dynamic Island / Speaker Pill */}
          <View style={styles.dynamicIslandContainer} pointerEvents="none">
            <View style={styles.dynamicIsland}>
              <View style={styles.cameraLens} />
              <View style={styles.sensorDot} />
            </View>
          </View>

          {/* Actual Screen Viewport */}
          <View style={styles.screenViewport}>
            {children}
          </View>

          {/* Bottom Home Indicator Bar */}
          <View style={styles.homeIndicatorContainer} pointerEvents="none">
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: '#DDEBFB',
  },
  outerDesktopWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundDetails: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgGlowOrb: {
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    position: 'absolute',
  },
  brandTag: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    opacity: 0.8,
  },
  brandTagTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    letterSpacing: 2.5,
    color: '#94A3B8',
  },
  brandTagSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  deviceShell: {
    width: 395,
    height: 830,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    padding: 10,
    // Realistic multi-stage phone shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 24,
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bezelBorder: {
    flex: 1,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: '#DDEBFB',
    position: 'relative',
  },
  dynamicIslandContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  dynamicIsland: {
    width: 116,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
    gap: 8,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sensorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    opacity: 0.8,
  },
  screenViewport: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  homeIndicator: {
    width: 134,
    height: 4.5,
    borderRadius: 100,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
});

export default WebDeviceFrame;
