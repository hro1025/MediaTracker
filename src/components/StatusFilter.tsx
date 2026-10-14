import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { Status } from '../domain/types';

export const STATUS_TABS: { status: Status; label: string }[] = [
  { status: 'watching', label: 'Watching' },
  { status: 'watchlist', label: 'Watchlist' },
  { status: 'done', label: 'Done' },
];

const INDICATOR_SHARE = 0.5;
const COLOR_IDLE = '#9a9ca5';
const COLOR_ACTIVE = '#a8c7fa';

export function StatusFilter(props: {
  onChange: (status: Status) => void;
  progress: Animated.Value;
}): React.JSX.Element {
  const { onChange, progress } = props;
  const [rowWidth, setRowWidth] = useState(0);

  const tabWidth = rowWidth / STATUS_TABS.length;
  const indicatorWidth = tabWidth * INDICATOR_SHARE;
  const indicatorOffset = (tabWidth - indicatorWidth) / 2;

  const translateX = progress.interpolate({
    inputRange: STATUS_TABS.map((_, i) => i),
    outputRange: STATUS_TABS.map((_, i) => i * tabWidth + indicatorOffset),
  });

  return (
    <View
      style={styles.row}
      onLayout={e => setRowWidth(e.nativeEvent.layout.width)}
    >
      {STATUS_TABS.map((tab, i) => {
        const color = progress.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [COLOR_IDLE, COLOR_ACTIVE, COLOR_IDLE],
          extrapolate: 'clamp',
        });
        return (
          <Pressable
            key={tab.status}
            style={styles.tab}
            onPress={() => onChange(tab.status)}
          >
            <Animated.Text style={[styles.label, { color }]}>
              {tab.label}
            </Animated.Text>
          </Pressable>
        );
      })}

      {rowWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: indicatorWidth, transform: [{ translateX }] },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLOR_ACTIVE,
  },
});
