import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';

interface FarmerAppLogoProps {
  size?: number;
  style?: ViewStyle;
}

export const FarmerAppLogo: React.FC<FarmerAppLogoProps> = ({
  size = 64,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Defs>
          {/* Outer Emerald Badge Gradient */}
          <SvgLinearGradient id="badgeGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#166534" />
            <Stop offset="100%" stopColor="#052e16" />
          </SvgLinearGradient>

          {/* Golden Harvest Grain Gradient */}
          <SvgLinearGradient id="goldGrad" x1="60" y1="30" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="50%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#D97706" />
          </SvgLinearGradient>

          {/* Leaf / Sprout Gradient */}
          <SvgLinearGradient id="leafGrad" x1="30" y1="80" x2="90" y2="105" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#4ADE80" />
            <Stop offset="100%" stopColor="#15803D" />
          </SvgLinearGradient>
        </Defs>

        {/* Outer Circular Seal with Double Golden Ring */}
        <Circle cx="60" cy="60" r="58" fill="url(#badgeGrad)" stroke="#F59E0B" strokeWidth="2.5" />
        <Circle cx="60" cy="60" r="53" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="3 3" opacity={0.6} />

        {/* Digital Mandi Connectivity Arcs (Top Smart Waves) */}
        <Path
          d="M42 30 C53 23 67 23 78 30"
          stroke="#FDE047"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.85}
        />
        <Path
          d="M49 36 C56 32 64 32 71 36"
          stroke="#FEF3C7"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.95}
        />

        {/* Protective Mandi Roof Canopy / Triangle Peak */}
        <Path
          d="M60 26 L76 40 H44 Z"
          fill="#F59E0B"
          opacity={0.35}
        />

        {/* Center Stylized Golden Wheat Ear / Grain Stalk */}
        {/* Central Stem */}
        <Path d="M60 38 V88" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" />

        {/* Top Tip Grain */}
        <Path
          d="M60 34 C58 37 58 41 60 43 C62 41 62 37 60 34 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />

        {/* Grain Pair 1 */}
        <Path
          d="M60 45 C54 44 50 49 53 54 C57 55 60 51 60 48 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />
        <Path
          d="M60 45 C66 44 70 49 67 54 C63 55 60 51 60 48 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />

        {/* Grain Pair 2 */}
        <Path
          d="M60 54 C53 53 48 58 51 63 C56 64 60 60 60 57 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />
        <Path
          d="M60 54 C67 53 72 58 69 63 C64 64 60 60 60 57 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />

        {/* Grain Pair 3 */}
        <Path
          d="M60 63 C52 62 47 67 50 72 C55 73 60 69 60 66 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />
        <Path
          d="M60 63 C68 62 73 67 70 72 C65 73 60 69 60 66 Z"
          fill="url(#goldGrad)"
          stroke="#FEF3C7"
          strokeWidth="0.8"
        />

        {/* Supportive Base Leaves (Embracing Growth & Farmer Hands) */}
        <G>
          {/* Left Leaf */}
          <Path
            d="M60 88 C45 86 32 78 28 66 C32 80 44 94 60 94 Z"
            fill="url(#leafGrad)"
          />
          {/* Right Leaf */}
          <Path
            d="M60 88 C75 86 88 78 92 66 C88 80 76 94 60 94 Z"
            fill="url(#leafGrad)"
          />
        </G>

        {/* Digital Foundation / Geometric Platform Base */}
        <Path
          d="M48 97 L60 102 L72 97 L60 92 Z"
          fill="#F59E0B"
        />
        <Circle cx="60" cy="97" r="2.5" fill="#FEF3C7" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
