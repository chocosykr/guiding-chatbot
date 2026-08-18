import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { bfsPath } from '../tour/bfs';
import { useTour } from '../tour/useTour';
import TourOverlay from '../tour/TourOverlay';
import { resolveIntents, type IntentResponse } from '../tour/resolveIntent';
import { siteGraph, type TourEdge } from '../siteGraph';

const NEW_PROJECT_FORM_STEPS = [
  { from: 'projects', to: 'projects', selector: '[data-tour-id="new-project-btn"]', message: 'First, open the New Project modal.' },
  { from: 'projects', to: 'projects', selector: '[data-tour-id="project-name-input"]', message: 'Enter a short, descriptive name for your project.' },
  { from: 'projects', to: 'projects', selector: '[data-tour-id="project-desc-input"]', message: 'Provide a brief description of what this project is for.' },
  { from: 'projects', to: 'projects', selector: '[data-tour-id="project-framework-select"]', message: 'Select the framework you are using.' },
  { from: 'projects', to: 'projects', selector: '[data-tour-id="project-visibility-radio"]', message: 'Choose who can see this project.' },
  { from: 'projects', to: 'projects', selector: '[data-tour-id="project-submit-btn"]', message: 'Click Create Project to finish!' },
];

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  // 1. Initialize messages from sessionStorage (or fall back to the default greeting)
  const [messages, setMessages] = useState<ChatMessage[]>([
  { id: 0, sender: 'bot', text: 'Hi! Tell me where you want to go and I will guide you there. Try: "Take me to billing" or "Show me pricing".' },
]);

  const messageCounter = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const addBotMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: messageCounter.current++, sender: 'bot', text }]);
  }, []);

const { tourState, startChainedTour, pathnameToNodeId, cancelTour } = useTour(addBotMessage);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track accumulated context if a clarification was asked
  const [context, setContext] = useState('');

  // Continuous Adaptive Layout calculation for Chat Box based on target element position
  const adaptiveLayout = useMemo(() => {
    const DEFAULT_LAYOUT = {
      height: 500,
      sx: { bottom: 96, top: 'auto', left: 'auto', right: 24 },
      isAdaptive: false,
    };

    if (!tourState.active || !tourState.targetRect) return DEFAULT_LAYOUT;

    const { left, top, width, height } = tourState.targetRect;
    const targetRight = left + width;
    const targetBottom = top + height;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Right column bounds for chat box (right: 24, width: 380)
    const chatWidth = 380;
    const margin = 16; // Safety margin around highlighted element
    const chatRightColLeft = windowWidth - 24 - chatWidth;
    const chatRightColRight = windowWidth - 24;

    // Check if target horizontally overlaps the chat column
    const isHorizontalOverlap = targetRight > (chatRightColLeft - margin) && left < (chatRightColRight + margin);
    if (!isHorizontalOverlap) return DEFAULT_LAYOUT;

    // Full unconstrained chat box occupies top: (windowHeight - 96 - 500) to bottom: (windowHeight - 96)
    const defaultChatTop = windowHeight - 96 - 500;
    const defaultChatBottom = windowHeight - 96;

    // Check if target vertically overlaps default chat bounds
    const isVerticalOverlap = targetBottom > (defaultChatTop - margin) && top < (defaultChatBottom + margin);
    if (!isVerticalOverlap) return DEFAULT_LAYOUT;

    // Calculate maximum available height below target (anchored to bottom: 96)
    const targetBottomWithMargin = targetBottom + margin;
    const heightBelow = windowHeight - 96 - targetBottomWithMargin;

    // Calculate maximum available height above target (anchored to top: 76)
    const targetTopWithMargin = top - margin;
    const topNavOffset = 76;
    const heightAbove = targetTopWithMargin - topNavOffset;

    const MIN_FEASIBLE_HEIGHT = 150;
    const MAX_DESIRED_HEIGHT = 500;

    // Prefer whichever side gives more height, provided it meets minimum feasible height
    if (heightBelow >= heightAbove && heightBelow >= MIN_FEASIBLE_HEIGHT) {
      const adaptiveHeight = Math.min(MAX_DESIRED_HEIGHT, Math.round(heightBelow));
      return {
        height: adaptiveHeight,
        sx: { bottom: 96, top: 'auto', left: 'auto', right: 24 },
        isAdaptive: true,
      };
    } else if (heightAbove >= MIN_FEASIBLE_HEIGHT) {
      const adaptiveHeight = Math.min(MAX_DESIRED_HEIGHT, Math.round(heightAbove));
      return {
        height: adaptiveHeight,
        sx: { top: topNavOffset, bottom: 'auto', left: 'auto', right: 24 },
        isAdaptive: true,
      };
    } else {
      // If neither side has enough height (e.g. huge element in right column), slide to left side
      return {
        height: 500,
        sx: { bottom: 96, top: 'auto', left: 24, right: 'auto' },
        isAdaptive: true,
      };
    }
  }, [tourState.active, tourState.targetRect]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // --- NEW: Natural language escape hatch ---
    const lowerInput = trimmedInput.toLowerCase();
    if (tourState.active && (lowerInput.includes('stop') || lowerInput.includes('cancel') || lowerInput.includes('quit') || lowerInput.includes('nevermind'))) {
      cancelTour();
      setMessages((prev) => [...prev, { id: messageCounter.current++, sender: 'user', text: trimmedInput }]);
      addBotMessage("Tour cancelled! What would you like to do instead?");
      setInput('');
      return;
    }
    // ------------------------------------------

    // Add user message
    setMessages((prev) => [...prev, { id: messageCounter.current++, sender: 'user', text: trimmedInput }]);
    setInput('');

    // ... rest of your handleSend logic ...

    // 1. Track current location via useLocation, map pathname -> current node ID
    const currentNodeId = pathnameToNodeId(location.pathname);

    if (!currentNodeId) {
      addBotMessage('I cannot determine your current location. Try navigating to a page first.');
      return;
    }

    // Combine previous context with new text
    const fullUserMessage = context ? `${context}\nUser: ${trimmedInput}` : trimmedInput;

   // 2. Call resolveIntent API — now returns an array of commands
    let commands: IntentResponse[] = [];

    try {
      const chatHistory = messages.slice(-6).map(m => `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.text}`).join('\n');

      const res = await fetch('/api/resolve-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: fullUserMessage, currentNodeId, chatHistory })
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      commands = Array.isArray(data.commands) ? data.commands : [data];
    } catch (err) {
      console.error('LLM Intent Resolution failed:', err);
      commands = resolveIntents(trimmedInput, currentNodeId, siteGraph);
    }

    if (commands.length === 0) {
      addBotMessage("I didn't quite understand that. Could you rephrase?");
      return;
    }

    // 3. Turn each command into a tour segment, tracking location as the chain progresses
    let runningNodeId = currentNodeId;
    const segments: { steps: TourEdge[]; startMessage?: string | null; completionMessage?: string | null }[] = [];
    for (const cmd of commands) {
      if (cmd.action === 'answer') {
        if (cmd.text) addBotMessage(cmd.text);
        continue;
      }

      if (cmd.action === 'clarify') {
        if (cmd.text) addBotMessage(cmd.text);
        setContext(fullUserMessage + `\nBot: ${cmd.text}`);
        break; // ambiguous — don't guess at the rest of the chain
      }

      if (cmd.action === 'form' && cmd.formId === 'new_project') {
        const navSteps = runningNodeId !== 'projects' ? bfsPath(runningNodeId, 'projects', siteGraph) : [];
        segments.push({
          steps: [...navSteps, ...NEW_PROJECT_FORM_STEPS],
          startMessage: cmd.startMessage || "I'll guide you through the New Project form. I'll skip any fields you've already filled out!",
          completionMessage: cmd.completionMessage || 'Project setup complete!',
        });
        runningNodeId = 'projects';
        continue;
      }

      if (cmd.action === 'navigate') {
        if (!cmd.targetNodeId || !siteGraph[cmd.targetNodeId]) {
          addBotMessage('I could not find where you want to go. Try mentioning a page name like "dashboard".');
          continue;
        }
        const targetLabel = siteGraph[cmd.targetNodeId].label;
        const steps = bfsPath(runningNodeId, cmd.targetNodeId, siteGraph);

        if (steps.length === 0) {
          segments.push({ steps: [], startMessage: null, completionMessage: `You're already on the ${targetLabel} page!` });
        } else {
          segments.push({
            steps,
            startMessage: cmd.startMessage || `I will guide you to ${targetLabel}. Follow the highlights!`,
            completionMessage: cmd.completionMessage || 'You are there!',
          });
        }
        runningNodeId = cmd.targetNodeId;
        continue;
      }
    }

    if (segments.length > 0) {
      setContext('');
      startChainedTour(segments);
    }
  }, [input, context, location.pathname, pathnameToNodeId, messages, addBotMessage, startChainedTour]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <TourOverlay targetRect={tourState.targetRect} active={tourState.active} message={tourState.message} />

      {/* Floating chat button */}
      <Fab
        aria-label={open ? 'Close tour guide' : 'Open tour guide'}
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: 'error.main',
          color: 'white',
          '&:hover': { bgcolor: 'error.dark' },
        }}
      >
        {open ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>

      {/* Chat panel */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            ...adaptiveLayout.sx,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            height: adaptiveLayout.height,
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                Tour Guide {adaptiveLayout.isAdaptive && '(Adaptive)'}
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
                  {/* Add whiteSpace: 'pre-line' here */}
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{msg.text}</Typography>
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