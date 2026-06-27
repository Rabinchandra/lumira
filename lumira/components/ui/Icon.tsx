import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'calendar'
  | 'list'
  | 'studio'
  | 'pin'
  | 'clock'
  | 'phone'
  | 'check'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'plus'
  | 'arrow-up-right'
  | 'logout'
  | 'trash'
  | 'wallet'
  | 'alert';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// Consistent 24x24 line-icon set. Rounded joins/caps, no fill, no photo imagery.
export default function Icon({ name, size = 22, color = '#1A1430', strokeWidth = 2 }: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths(name, common, color)}
    </Svg>
  );
}

function paths(name: IconName, c: any, color: string) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path d="M3 10.5 12 3l9 7.5" {...c} />
          <Path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" {...c} />
          <Path d="M9.5 21v-6h5v6" {...c} />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x="3.5" y="5" width="17" height="16" rx="3" {...c} />
          <Line x1="3.5" y1="9.5" x2="20.5" y2="9.5" {...c} />
          <Line x1="8" y1="3" x2="8" y2="6.5" {...c} />
          <Line x1="16" y1="3" x2="16" y2="6.5" {...c} />
        </>
      );
    case 'list':
      return (
        <>
          <Line x1="8" y1="6.5" x2="20" y2="6.5" {...c} />
          <Line x1="8" y1="12" x2="20" y2="12" {...c} />
          <Line x1="8" y1="17.5" x2="20" y2="17.5" {...c} />
          <Circle cx="4" cy="6.5" r="1.4" fill={color} stroke="none" />
          <Circle cx="4" cy="12" r="1.4" fill={color} stroke="none" />
          <Circle cx="4" cy="17.5" r="1.4" fill={color} stroke="none" />
        </>
      );
    case 'studio':
      // Storefront / studio building — no camera/photo imagery
      return (
        <>
          <Path d="M4 9.5 5.2 4.5h13.6L20 9.5" {...c} />
          <Path d="M4 9.5a2.4 2.4 0 0 0 4 1 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4-1" {...c} />
          <Path d="M5.2 11v8.5a1 1 0 0 0 1 1h11.6a1 1 0 0 0 1-1V11" {...c} />
          <Path d="M9.5 20.5v-4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4.5" {...c} />
        </>
      );
    case 'pin':
      return (
        <>
          <Path d="M12 21c4.5-4.2 6.5-7.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 13.6 7.5 16.8 12 21Z" {...c} />
          <Circle cx="12" cy="10.5" r="2.4" {...c} />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" {...c} />
          <Polyline points="12 7 12 12 15.5 14" {...c} />
        </>
      );
    case 'phone':
      return (
        <Path
          d="M6.5 4h3l1.5 4.2-2 1.4a11 11 0 0 0 5.4 5.4l1.4-2 4.2 1.5v3a1.8 1.8 0 0 1-2 1.8C12.4 19.6 4.4 11.6 4.7 6a1.8 1.8 0 0 1 1.8-2Z"
          {...c}
        />
      );
    case 'check':
      return <Polyline points="4.5 12.5 9.5 17.5 19.5 6.5" {...c} />;
    case 'chevron-left':
      return <Polyline points="15 5 8 12 15 19" {...c} />;
    case 'chevron-right':
      return <Polyline points="9 5 16 12 9 19" {...c} />;
    case 'close':
      return (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...c} />
          <Line x1="18" y1="6" x2="6" y2="18" {...c} />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...c} />
          <Line x1="5" y1="12" x2="19" y2="12" {...c} />
        </>
      );
    case 'arrow-up-right':
      return (
        <>
          <Line x1="7" y1="17" x2="17" y2="7" {...c} />
          <Polyline points="8.5 7 17 7 17 15.5" {...c} />
        </>
      );
    case 'logout':
      return (
        <>
          <Path d="M14 5H6.5a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6.5 19H14" {...c} />
          <Polyline points="14.5 8.5 19 12 14.5 15.5" {...c} />
          <Line x1="19" y1="12" x2="9.5" y2="12" {...c} />
        </>
      );
    case 'trash':
      return (
        <>
          <Polyline points="4.5 7 19.5 7" {...c} />
          <Path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7" {...c} />
          <Path d="M6.5 7l.9 12.1a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" {...c} />
          <Line x1="10" y1="11" x2="10" y2="17" {...c} />
          <Line x1="14" y1="11" x2="14" y2="17" {...c} />
        </>
      );
    case 'wallet':
      return (
        <>
          <Path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h11A1.5 1.5 0 0 1 18 7.5" {...c} />
          <Path d="M4 7.5v10A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5V11a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 1 4 8" {...c} />
          <Circle cx="16" cy="14.25" r="1.1" fill={color} stroke="none" />
        </>
      );
    case 'alert':
      return (
        <>
          <Path d="M12 3.5 22 19.5a1 1 0 0 1-.86 1.5H2.86A1 1 0 0 1 2 19.5L12 3.5Z" {...c} />
          <Line x1="12" y1="9" x2="12" y2="14" {...c} />
          <Circle cx="12" cy="17.3" r="1.2" fill={color} stroke="none" />
        </>
      );
    default:
      return null;
  }
}
