# Quick Component Reference - Mission Control iOS

## Import Statements

```typescript
// Screens
import DashboardScreen from '../screens/DashboardScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import BriefingsScreen from '../screens/BriefingsScreen';

// Components
import GlassCard from '../components/GlassCard';
import AgentStatusBadge from '../components/AgentStatusBadge';
import ProgressIndicator from '../components/ProgressIndicator';
import TaskCard from '../components/TaskCard';
import BriefingPreview from '../components/BriefingPreview';

// Theme
import { Colors, Typography, Spacing } from '../theme';
import { useTheme } from '../hooks/useTheme';

// Navigation
import { useNavigation } from '@react-navigation/native';

// State
import { useStore } from '../store';
```

---

## GlassCard

**Purpose:** Frosted glass container for content

```typescript
// Basic
<GlassCard>
  <Text>Content</Text>
</GlassCard>

// With style
<GlassCard style={{ marginBottom: Spacing.lg }}>
  <Text>Styled content</Text>
</GlassCard>

// Scrollable
<GlassCard scrollable={true}>
  <View style={{ height: 500 }}>
    {/* Long content */}
  </View>
</GlassCard>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | React.ReactNode | - | Card content |
| style | ViewStyle | - | Custom styles |
| scrollable | boolean | false | Enable scroll |
| onPress | () => void | - | Tap handler |

---

## AgentStatusBadge

**Purpose:** Status indicator with color and icon

```typescript
// Basic - idle
<AgentStatusBadge status="idle" />

// Working
<AgentStatusBadge status="working" />

// Complete
<AgentStatusBadge status="complete" />

// With label
<AgentStatusBadge status="working" label="In Progress" />

// Size variants
<AgentStatusBadge status="idle" size="small" />
<AgentStatusBadge status="idle" size="medium" />
<AgentStatusBadge status="idle" size="large" />
```

**Props:**
| Prop | Type | Default | Values |
|------|------|---------|--------|
| status | string | - | idle, working, complete, error |
| label | string | auto | Custom label text |
| size | string | medium | small, medium, large |

**Colors:**
- idle: Gray (#999)
- working: Orange (#FF9500)
- complete: Green (#34C759)
- error: Red (#FF3B30)

---

## ProgressIndicator

**Purpose:** Progress display (circular or linear)

```typescript
// Circular progress
<ProgressIndicator 
  progress={75}
  type="circular"
  size="medium"
  showPercentage={true}
/>

// Linear progress
<ProgressIndicator 
  progress={75}
  type="linear"
  showLabel={true}
  showPercentage={true}
/>

// Custom color
<ProgressIndicator 
  progress={50}
  type="linear"
  color={Colors.success}
/>
```

**Props:**
| Prop | Type | Default | Values |
|------|------|---------|--------|
| progress | number | - | 0-100 |
| type | string | circular | circular, linear |
| size | string | medium | small, medium, large |
| showLabel | boolean | true | Show "Progress" text |
| color | string | primary blue | Any color |
| showPercentage | boolean | true | Show % value |

---

## TaskCard

**Purpose:** Task summary card with status and actions

```typescript
// Basic
<TaskCard
  id="task-1"
  title="Quarterly Review"
  status="working"
  priority="high"
  onPress={() => navigate('TaskDetails')}
/>

// Full featured
<TaskCard
  id="task-1"
  title="Quarterly Review"
  description="Financial analysis Q1 2026"
  status="working"
  progress={65}
  priority="high"
  agentName="Scout"
  onPress={() => navigate('TaskDetails', { taskId: 'task-1' })}
  showActions={false}
/>

// With approval actions
<TaskCard
  id="task-1"
  title="Task Awaiting Review"
  status="working"
  priority="high"
  showActions={true}
  onApprove={() => approveTask('task-1')}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | Task identifier |
| title | string | - | Task title |
| description | string | - | Detailed description |
| status | string | - | idle, working, complete, scheduled |
| priority | string | - | high, medium, low |
| progress | number | 0 | 0-100 percentage |
| agentName | string | - | Assigned agent name |
| onPress | () => void | - | Card tap handler |
| onApprove | () => void | - | Approve button handler |
| showActions | boolean | false | Show approve/reject buttons |

---

## BriefingPreview

**Purpose:** Briefing list item display

```typescript
// Basic
<BriefingPreview
  id="brief-1"
  title="Q1 Financial Analysis"
  status="ready"
  agent="Scout"
  onPress={() => navigate('BriefingDetail')}
/>

// Full featured
<BriefingPreview
  id="brief-1"
  title="Q1 Financial Analysis"
  status="complete"
  agent="Scout"
  taskId="task-1"
  content="Comprehensive analysis of Q1 revenue streams..."
  createdAt={new Date().toISOString()}
  onPress={() => navigate('BriefingDetail', { briefingId: 'brief-1' })}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | Briefing ID |
| title | string | - | Briefing title |
| status | string | - | draft, ready, executing, complete |
| agent | string | - | Agent/owner name |
| taskId | string | - | Associated task |
| content | string | - | Content preview |
| createdAt | string | - | ISO date string |
| onPress | () => void | - | Tap handler |

**Status Colors:**
- draft: Gray
- ready: Blue
- executing: Orange
- complete: Green

---

## Theme Usage

```typescript
// Colors
<View style={{ backgroundColor: Colors.background }}>
  <Text style={{ color: Colors.text }}>Text</Text>
  <Text style={{ color: Colors.textSecondary }}>Secondary</Text>
</View>

// Typography
<Text style={Typography.h1}>Heading 1</Text>
<Text style={Typography.body}>Body text</Text>
<Text style={[Typography.label, { color: Colors.primary }]}>
  Button text
</Text>

// Spacing
<View style={{ padding: Spacing.lg, gap: Spacing.md }}>
  <Text>Content</Text>
</View>

// Custom styles with theme
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
});
```

---

## Navigation

```typescript
import { useNavigation } from '@react-navigation/native';

const MyComponent = () => {
  const navigation = useNavigation();
  
  // Navigate to screen
  navigation.navigate('DashboardHome');
  
  // Navigate with params
  navigation.navigate('TaskDetails', { taskId: 'task-1' });
  
  // Navigate to nested screen
  navigation.navigate('Dashboard', {
    screen: 'TaskDetails',
    params: { taskId: 'task-1' }
  });
  
  // Go back
  navigation.goBack();
  
  // Replace current screen
  navigation.replace('DashboardHome');
};
```

---

## State Management

```typescript
import { useStore } from '../store';

// Get single value
const tasks = useStore((state) => state.tasks);
const briefings = useStore((state) => state.briefings);

// Get multiple values
const { tasks, briefings, user } = useStore();

// Use action
const { setTasks, addTask, updateTask } = useStore();

// In useEffect
useEffect(() => {
  const tasks = useStore.getState().tasks;
  const setTasks = useStore.getState().setTasks;
}, []);
```

---

## Common Patterns

### Screen with Pull-to-Refresh

```typescript
import { useState } from 'react';
import { RefreshControl } from 'react-native';

const MyScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Load data
    setRefreshing(false);
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Content */}
    </ScrollView>
  );
};
```

### Styled Button

```typescript
<TouchableOpacity
  style={[
    styles.button,
    { backgroundColor: Colors.primary }
  ]}
  onPress={() => {}}
>
  <Text style={[Typography.label, { color: Colors.text }]}>
    Press Me
  </Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.radius.md,
    alignItems: 'center',
  },
});
```

### List of Items

```typescript
<ScrollView>
  {tasks.map((task) => (
    <TaskCard
      key={task.id}
      {...task}
      onPress={() => navigate('TaskDetails', { taskId: task.id })}
    />
  ))}
</ScrollView>
```

---

## Color Tokens Quick Reference

```typescript
// Backgrounds
Colors.background      // Dark navy (main)
Colors.surface         // Glass surface (cards)
Colors.surfaceLight    // Lighter glass (hover)

// Text
Colors.text            // Primary text (white)
Colors.textSecondary   // 70% opacity white
Colors.textTertiary    // 50% opacity white

// States
Colors.primary         // Blue (#0066ff)
Colors.success         // Green (#34c759)
Colors.warning         // Orange (#ff9500)
Colors.danger          // Red (#ff3b30)

// Utilities
Colors.border          // 10% white
Colors.borderStrong    // 15% white
```

---

## Typography Tokens Quick Reference

```typescript
Typography.h1         // 32px, weight 700
Typography.h2         // 28px, weight 700
Typography.h3         // 24px, weight 600
Typography.h4         // 20px, weight 600
Typography.h5         // 18px, weight 600

Typography.body       // 16px, weight 400
Typography.bodySmall  // 14px, weight 400
Typography.bodyXSmall // 12px, weight 400

Typography.label      // 16px, weight 500
Typography.labelSmall // 14px, weight 500

Typography.caption    // 12px, weight 400
```

---

## Spacing Tokens Quick Reference

```typescript
Spacing.xs    // 4px
Spacing.sm    // 8px
Spacing.md    // 12px
Spacing.lg    // 16px
Spacing.xl    // 20px
Spacing.xxl   // 24px
Spacing.xxxl  // 32px

// Border radius
Spacing.radius.xs     // 4px
Spacing.radius.md     // 8px
Spacing.radius.lg     // 12px
Spacing.radius.full   // 999px (pill)

// Constants
Spacing.touchTarget   // 44px
Spacing.screenPadding // 16px
```

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Colors not showing | Import from `../theme` |
| Navigation error | Check screen names in RootNavigator |
| Component not found | Verify import path ends with `.tsx` |
| Styles not applied | Use `StyleSheet.create()` + theme tokens |
| Store undefined | Import `useStore` from `../store` |
| Spacing wrong | Use `Spacing.xs/sm/md/lg/xl/xxl/xxxl` constants |

---

## Useful Commands

```bash
# Start dev server
npm start

# Run on iOS simulator
npm run ios

# Run tests
npm test

# Lint code
npm run lint

# Build for production
eas build --platform ios
```

---

**Last Updated:** March 29, 2026  
**Framework:** React Native 0.81.5 + Expo 54
