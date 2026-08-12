import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.15), 0 0 20px 4px rgba(25, 118, 210, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.25), 0 0 30px 8px rgba(25, 118, 210, 0.6);
  }
`;

interface TourOverlayProps {
  targetRect: { top: number; left: number; width: number; height: number } | null;
  active: boolean;
}

export default function TourOverlay({ targetRect, active }: TourOverlayProps) {
  const [rect, setRect] = useState(targetRect);

  // Smoothly track the rect from props (updated via rAF in the hook)
  useEffect(() => {
    setRect(targetRect);
  }, [targetRect]);

  if (!active || !rect) return null;

  const tooltipTop = rect.top + rect.height + 12;
  const tooltipLeft = rect.left + rect.width / 2;

  return (
    <>
      {/* Highlight outline */}
      <Box
        sx={{
          position: 'fixed',
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          borderRadius: 1,
          pointerEvents: 'none',
          zIndex: 9998,
          border: '2px solid',
          borderColor: 'primary.main',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      />
      {/* "Click here" tooltip */}
      <Box
        sx={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          transform: 'translateX(-50%)',
          zIndex: 9999,
          pointerEvents: 'none',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          boxShadow: 3,
          whiteSpace: 'nowrap',
        }}
      >
        <Typography variant="caption" fontWeight={600}>
          Click here
        </Typography>
        {/* Arrow pointing up */}
        <Box
          sx={{
            position: 'absolute',
            top: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid',
            borderBottomColor: 'primary.main',
          }}
        />
      </Box>
    </>
  );
}
