import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { keyframes } from '@mui/system';

const auraGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4), 0 0 25px 6px rgba(168, 85, 247, 0.4), inset 0 0 15px rgba(99, 102, 241, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.7), 0 0 40px 12px rgba(168, 85, 247, 0.75), inset 0 0 25px rgba(168, 85, 247, 0.35);
  }
`;

const gentleFloat = keyframes`
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -6px); }
`;

const badgePulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.06); opacity: 0.9; }
`;

interface TourOverlayProps {
  targetRect: { top: number; left: number; width: number; height: number } | null;
  active: boolean;
  message?: string | null;
}

export default function TourOverlay({ targetRect, active, message }: TourOverlayProps) {
  const [rect, setRect] = useState(targetRect);

  useEffect(() => {
    setRect(targetRect);
  }, [targetRect]);

  if (!active || !rect) return null;

  const windowHeight = window.innerHeight;
  const padding = 8;
  const boxTop = rect.top - padding;
  const boxLeft = rect.left - padding;
  const boxWidth = rect.width + padding * 2;
  const boxHeight = rect.height + padding * 2;

  // Smart Tooltip Orientation: place above target if target is near bottom
  const fitsBelow = boxTop + boxHeight + 90 < windowHeight;
  const tooltipTop = fitsBelow ? boxTop + boxHeight + 14 : boxTop - 64;
  const tooltipLeft = Math.max(150, Math.min(window.innerWidth - 150, rect.left + rect.width / 2));

  return (
    <>
      {/* 1. Darkened Spotlight Mask (dimmed backdrop outside the target cutout) */}
      <Box
        sx={{
          position: 'fixed',
          top: boxTop,
          left: boxLeft,
          width: boxWidth,
          height: boxHeight,
          borderRadius: 2.5,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)', // Rich obsidian dimming
          pointerEvents: 'none',
          zIndex: 1250,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* 2. Cyberpunk Glowing Target HUD Ring */}
      <Box
        sx={{
          position: 'fixed',
          top: boxTop,
          left: boxLeft,
          width: boxWidth,
          height: boxHeight,
          borderRadius: 2.5,
          pointerEvents: 'none',
          zIndex: 1251,
          border: '2px solid #818cf8',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          animation: `${auraGlow} 2s ease-in-out infinite`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Corner HUD Bracket Accents */}
        <Box sx={{ position: 'absolute', top: -3, left: -3, width: 14, height: 14, borderTop: '3px solid #c084fc', borderLeft: '3px solid #c084fc', borderTopLeftRadius: 6 }} />
        <Box sx={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderTop: '3px solid #c084fc', borderRight: '3px solid #c084fc', borderTopRightRadius: 6 }} />
        <Box sx={{ position: 'absolute', bottom: -3, left: -3, width: 14, height: 14, borderBottom: '3px solid #c084fc', borderLeft: '3px solid #c084fc', borderBottomLeftRadius: 6 }} />
        <Box sx={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderBottom: '3px solid #c084fc', borderRight: '3px solid #c084fc', borderBottomRightRadius: 6 }} />
      </Box>

      {/* 3. Glassmorphic Guidance Tooltip */}
      <Box
        sx={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          zIndex: 1400,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#f8fafc',
          px: 2,
          py: 1.25,
          borderRadius: 3,
          border: '1px solid rgba(168, 85, 247, 0.45)',
          boxShadow: '0 20px 35px -8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.35)',
          maxWidth: 300,
          textAlign: 'center',
          animation: `${gentleFloat} 3s ease-in-out infinite`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 0.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: 14, color: '#c084fc' }} />
          <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#a5b4fc', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Tour Guide Hint
          </Typography>
        </Box>

        <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.35, fontSize: '0.85rem', color: '#ffffff' }}>
          {message || 'Click or interact with the highlighted area'}
        </Typography>

        {/* Directional Arrow Indicator */}
        <Box
          sx={{
            position: 'absolute',
            ...(fitsBelow
              ? { top: -7, borderBottom: '7px solid #0f172a' }
              : { bottom: -7, borderTop: '7px solid #1e1b4b' }),
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
          }}
        />
      </Box>
    </>
  );
}