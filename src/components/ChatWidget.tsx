import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { siteGraph } from '../siteGraph';
import { resolveIntent } from '../tour/resolveIntent';
import { bfsPath } from '../tour/bfs';
import { useTour } from '../tour/useTour';
import TourOverlay from '../tour/TourOverlay';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, sender: 'bot', text: 'Hi! Tell me where you want to go and I will guide you there. Try: "Take me to billing" or "Show me pricing".' },
  ]);
  const messageCounter = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const addBotMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: messageCounter.current++, sender: 'bot', text }]);
  }, []);

  const { tourState, startTour, pathnameToNodeId, cancelTour } = useTour(addBotMessage);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMessages((prev) => [...prev, { id: messageCounter.current++, sender: 'user', text }]);
    setInput('');

    // 1. Track current location via useLocation, map pathname -> current node ID
    const currentNodeId = pathnameToNodeId(location.pathname);

    if (!currentNodeId) {
      addBotMessage('I cannot determine your current location. Try navigating to a page first.');
      return;
    }

    // 2. Call resolveIntent to find the best-matching target node
    // TODO: replace with real LLM API call
    const targetNodeId = resolveIntent(text, currentNodeId, siteGraph);

    if (!targetNodeId) {
      addBotMessage('I could not find where you want to go. Try mentioning a page name like "dashboard", "pricing", "billing", or "notifications".');
      return;
    }

    const targetNode = siteGraph[targetNodeId];
    addBotMessage(`I will guide you to ${targetNode.label}. Follow the highlights!`);

    // 3. Run BFS from current node to target node
    const steps = bfsPath(currentNodeId, targetNodeId, siteGraph);

    // 4. Execute the tour
    startTour(steps);
  }, [input, location.pathname, pathnameToNodeId, addBotMessage, startTour]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <TourOverlay targetRect={tourState.targetRect} active={tourState.active} />

      {/* Floating chat button */}
      <Fab
        color="primary"
        aria-label={open ? 'Close tour guide' : 'Open tour guide'}
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat panel */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            height: 500,
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Tour Guide
              </Typography>
            </Box>
            {tourState.active && (
              <Button
                size="small"
                onClick={cancelTour}
                sx={{ color: 'primary.contrastText', textTransform: 'none', fontSize: '0.75rem' }}
              >
                Cancel Tour
              </Button>
            )}
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'background.default',
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: msg.sender === 'bot' ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Where do you want to go?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}
