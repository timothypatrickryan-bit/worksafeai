/**
 * ProgressIndicator Component
 * Circular and linear progress indicators with animation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../theme';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  type?: 'circular' | 'linear';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  color?: string;
  showPercentage?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress: initialProgress,
  type = 'circular',
  size = 'medium',
  showLabel = true,
  color = Colors.primary,
  showPercentage = true,
}) => {
  const [animatedProgress] = useState(() => {
    return withTiming(initialProgress, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  });

  if (type === 'circular') {
    return (
      <CircularProgress
        progress={initialProgress}
        size={size}
        color={color}
        showLabel={showLabel}
        showPercentage={showPercentage}
      />
    );
  }

  return (
    <LinearProgress
      progress={initialProgress}
      color={color}
      showLabel={showLabel}
      showPercentage={showPercentage}
    />
  );
};

interface CircularProgressProps {
  progress: number;
  size: 'small' | 'medium' | 'large';
  color: string;
  showLabel: boolean;
  showPercentage: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size,
  color,
  showLabel,
  showPercentage,
}) => {
  const sizeMap = {
    small: 60,
    medium: 100,
    large: 140,
  };

  const dimension = sizeMap[size];
  const radius = (dimension - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.circularContainer}>
      <View style={{ position: 'relative', width: dimension, height: dimension }}>
        {/* Background circle */}
        <Animated.View
          style={{
            position: 'absolute',
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            borderWidth: 8,
            borderColor: Colors.border,
          }}
        />

        {/* Progress circle - approximate with View */}
        <View
          style={[
            {
              position: 'absolute',
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              borderWidth: 8,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              opacity: progress / 100,
            },
          ]}
        />

        {/* Center content */}
        {showPercentage && (
          <View style={styles.circularCenter}>
            <Text style={[styles.percentage, { fontSize: size === 'large' ? 36 : 24 }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const LinearProgress: React.FC<{
  progress: number;
  color: string;
  showLabel: boolean;
  showPercentage: boolean;
}> = ({ progress, color, showLabel, showPercentage }) => {
  return (
    <View style={styles.linearContainer}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progress</Text>
          {showPercentage && (
            <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.linearTrack, { backgroundColor: Colors.border }]}>
        <Animated.View
          style={[
            styles.linearFill,
            {
              backgroundColor: color,
              width: `${Math.min(progress, 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linearContainer: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  labelText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  percentageText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  linearTrack: {
    height: 6,
    borderRadius: Spacing.radius.full,
    overflow: 'hidden',
  },
  linearFill: {
    height: '100%',
    borderRadius: Spacing.radius.full,
  },
  percentage: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
});

export default ProgressIndicator;
