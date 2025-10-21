# 🎮 Haptic Feedback System

## Overview

The Aasta app features a comprehensive haptic feedback system that makes the app feel alive and responsive. All haptic feedback uses the **Web Vibration API**, which works reliably across both Android and iOS devices.

## Architecture

```
src/haptics/
├── types.ts                 # Haptic patterns and configurations
├── service.ts              # Core haptic service (singleton)
├── interactions.ts         # Specific haptic functions
├── useHapticFeedback.ts   # React hook
└── index.ts               # Main exports
```

## Quick Start

### Option 1: Direct Import (Recommended for simple cases)

```typescript
import { hapticButtonPress, hapticAddToCart, hapticSuccess } from '@/haptics';

function MyButton() {
  const handleClick = () => {
    hapticButtonPress();
    // ... rest of logic
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Option 2: React Hook (Recommended for components)

```typescript
import { useHapticFeedback } from '@/haptics';

function MyComponent() {
  const { onButtonPress, onAddToCart, onSuccess } = useHapticFeedback();
  
  const handleAddItem = () => {
    onAddToCart();
    // ... add to cart logic
  };
  
  return <button onClick={handleAddItem}>Add to Cart</button>;
}
```

## Available Haptic Patterns

### User Actions
- `hapticLightTap()` - 50ms - General touches
- `hapticButtonPress()` - 100ms - Button presses
- `hapticLongPress()` - 200ms - Long press actions

### Cart Actions
- `hapticAddToCart()` - 75ms - Item added to cart
- `hapticIncreaseQuantity()` - 60ms - Increase quantity
- `hapticDecreaseQuantity()` - 60ms - Decrease quantity
- `hapticRemoveFromCart()` - 120ms - Remove item

### Success States
- `hapticSuccess()` - [100, 50, 100] - Success confirmation (double pulse)
- `hapticOrderPlaced()` - [100, 100, 150] - Order placed successfully

### Warnings & Errors
- `hapticWarning()` - 150ms - Warning feedback
- `hapticError()` - 200ms - Error feedback
- `hapticSoldOut()` - [100, 50, 100, 50, 100] - Item sold out

### Navigation
- `hapticPageChange()` - 80ms - Page navigation
- `hapticModalOpen()` - 60ms - Modal/sheet opening
- `hapticModalClose()` - 50ms - Modal/sheet closing
- `hapticSwipe()` - 40ms - Swipe gesture

### UI Interactions
- `hapticToggle()` - 70ms - Toggle switch
- `hapticPullRefresh()` - 100ms - Pull to refresh

### Notifications
- `hapticNotification()` - [100, 100, 100] - General notification
- `hapticOrderUpdate()` - [80, 60, 120] - Order status update

## Custom Patterns

```typescript
import { customHaptic } from '@/haptics';

// Single vibration
customHaptic(150); // Vibrate for 150ms

// Pattern vibration
customHaptic([100, 50, 100]); // Vibrate-pause-vibrate
```

## Toast with Haptics

Use the enhanced toast that automatically adds haptic feedback:

```typescript
import { toast } from '@/lib/toast-with-haptics';

// Success toast with haptic
toast.success('Item added to cart!');

// Error toast with haptic
toast.error('Failed to add item');

// Warning toast with haptic
toast.warning('Only 2 left in stock');
```

## Where Haptics are Used

### ✅ Currently Implemented

1. **Product Cards**
   - Card tap → Light haptic
   - Add to cart → Add to cart haptic
   - Increase quantity → Increase haptic
   - Decrease quantity → Decrease haptic

2. **Hack of the Day Cards**
   - Add to cart → Add to cart haptic
   - Quantity controls → Increase/decrease haptic

3. **Product Bottom Sheet**
   - Open → Modal open haptic
   - Close → Modal close haptic
   - Quantity controls → Increase/decrease haptic
   - Add to cart → Add to cart haptic

4. **Toasts** (via toast-with-haptics)
   - Success → Success haptic
   - Error → Error haptic
   - Warning → Warning haptic

### 🚀 Recommended Future Additions

1. **Navigation**
   ```typescript
   // In navigation components
   import { hapticPageChange } from '@/haptics';
   
   const handleNavigate = () => {
     hapticPageChange();
     router.push('/orders');
   };
   ```

2. **Toggle Switches**
   ```typescript
   import { hapticToggle } from '@/haptics';
   
   const handleToggleVeg = () => {
     hapticToggle();
     setVegOnly(!vegOnly);
   };
   ```

3. **Pull to Refresh**
   ```typescript
   import { hapticPullRefresh } from '@/haptics';
   
   const handleRefresh = () => {
     hapticPullRefresh();
     // ... refresh logic
   };
   ```

4. **Order Placement**
   ```typescript
   import { hapticOrderPlaced } from '@/haptics';
   
   const placeOrder = async () => {
     await api.placeOrder();
     hapticOrderPlaced(); // Success pattern!
     toast.success('Order placed successfully!');
   };
   ```

## How It Works

1. **Web Vibration API**: Uses `navigator.vibrate()` which works in WebView
2. **Pattern Support**: Can vibrate in patterns (vibrate-pause-vibrate)
3. **Graceful Degradation**: If vibration isn't supported, silently fails
4. **No Dependencies**: Pure JavaScript, no Capacitor plugin needed
5. **Universal**: Works on both Android & iOS

## Performance

- **Lightweight**: < 2KB total
- **No async overhead**: Synchronous vibration calls
- **Optimized**: Singleton pattern, memoized hooks
- **Battery efficient**: Short, targeted vibrations

## Best Practices

1. **Be Consistent**
   - Use the same haptic for the same action
   - Don't overuse haptics

2. **Match Intensity to Action**
   - Light tap for taps
   - Medium for actions
   - Heavy for important events

3. **Timing**
   - Trigger haptic IMMEDIATELY when user acts
   - Don't wait for API responses

4. **Patterns**
   - Use success pattern for completions
   - Use error pattern for failures
   - Use notification pattern for updates

## Troubleshooting

### Haptics not working?

1. **Check device support**:
   ```typescript
   import { haptics } from '@/haptics';
   console.log(haptics.isEnabled()); // Should be true
   ```

2. **Device settings**: User may have vibration disabled in system settings

3. **Browser compatibility**: Works in all modern browsers and WebViews

### Too strong/weak vibrations?

Adjust the duration in `types.ts`:
```typescript
[HapticPattern.BUTTON_PRESS]: {
  pattern: 80, // Reduced from 100ms
  description: 'Lighter button press'
}
```

## Examples

### Example 1: Cart Button

```typescript
import { hapticAddToCart } from '@/haptics';

function AddToCartButton({ item }: { item: Product }) {
  const handleAdd = () => {
    hapticAddToCart();
    addToCart(item);
    toast.success('Added to cart!');
  };
  
  return <button onClick={handleAdd}>Add to Cart</button>;
}
```

### Example 2: Navigation

```typescript
import { hapticPageChange } from '@/haptics';
import { useRouter } from 'next/navigation';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  
  const handleClick = () => {
    hapticPageChange();
    router.push(href);
  };
  
  return <a onClick={handleClick}>{children}</a>;
}
```

### Example 3: Form Submit

```typescript
import { hapticSuccess, hapticError } from '@/haptics';

async function handleSubmit() {
  try {
    await submitForm();
    hapticSuccess();
    toast.success('Saved!');
  } catch (error) {
    hapticError();
    toast.error('Failed to save');
  }
}
```

## Contributing

To add a new haptic pattern:

1. Add to `types.ts`:
   ```typescript
   export enum HapticPattern {
     MY_NEW_PATTERN = 'my_new_pattern',
   }
   
   export const HAPTIC_PATTERNS: Record<HapticPattern, HapticConfig> = {
     [HapticPattern.MY_NEW_PATTERN]: {
       pattern: 120,
       description: 'My new pattern'
     },
   };
   ```

2. Add to `interactions.ts`:
   ```typescript
   export const hapticMyNewPattern = () => {
     triggerHaptic(HapticPattern.MY_NEW_PATTERN);
   };
   ```

3. Export from `index.ts`:
   ```typescript
   export { hapticMyNewPattern } from './interactions';
   ```

4. Use it:
   ```typescript
   import { hapticMyNewPattern } from '@/haptics';
   hapticMyNewPattern();
   ```

## License

Part of the Aasta food delivery platform.

