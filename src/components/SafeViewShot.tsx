import React, { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';

// Define the shape of ViewShot to satisfy TypeScript consumers
// We import type only so it doesn't trigger the runtime require
import type { ViewShot } from 'react-native-view-shot';

let RNViewShot: any;
try {
    // Try to require the native module. 
    // If it throws (e.g. TurboModuleRegistry error), we catch it.
    RNViewShot = require('react-native-view-shot').default;
} catch (error) {
    console.warn('[SafeViewShot] Failed to load react-native-view-shot:', error);
    RNViewShot = null;
}

export type SafeViewShotProps = ViewProps & {
    options?: any;
    children?: React.ReactNode;
};

const SafeViewShot = forwardRef<any, SafeViewShotProps>((props, ref) => {
    if (RNViewShot) {
        return <RNViewShot {...props} ref={ref} />;
    }

    // Fallback: just render a View
    // We can't actually "capture" this, but at least the app won't crash
    return <View {...props}>{props.children}</View>;
});

SafeViewShot.displayName = 'SafeViewShot';

export default SafeViewShot;
