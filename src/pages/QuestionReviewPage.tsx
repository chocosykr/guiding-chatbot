import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

export const keywords = ['review', 'questions', 'progress', 'portal', 'validate', 'filter', 'type', 'department', 'rank', 'topic', 'status', 'reviewed'];

// ── Types & seed data ───────────────────────────────────────────────────────
interface Option { text: string; isCorrect: boolean }
interface Question {
  id: number;
  title: string;
  type: string;
  topic: string;
  dept: string;
  rank: string;
  difficulty: string;
  reviewedBy: string;
  reviewStatus: 'Pending' | 'Reviewed';
  options: Option[];
}

const seedQuestions: Question[] = [
  {
    id: 1,
    title: 'During a critical machinery breakdown, the Chief Engineer issues a directive that contradicts a standard operating procedure you believe is safer. As the 2nd Engineer, what is the best course of action?',
    type: 'Multiple Choice', topic: 'Behavioural', dept: 'Engine', rank: '2nd Engineer', difficulty: 'Intermediate',
    reviewedBy: 'All', reviewStatus: 'Pending',
    options: [
      { text: 'Follow the directive without question', isCorrect: false },
      { text: 'Politely raise concerns to the Chief Engineer', isCorrect: true },
      { text: 'Immediately contact the Captain', isCorrect: false },
      { text: 'Refuse to carry out the directive', isCorrect: false },
    ],
  },
  {
    id: 2,
    title: 'A crew member reports fatigue to you during a critical watch. What is the most appropriate immediate action?',
    type: 'Multiple Response', topic: 'Behavioural', dept: 'Engine', rank: '2nd Engineer', difficulty: 'Intermediate',
    reviewedBy: 'All', reviewStatus: 'Pending',
    options: [
      { text: 'Document the report in the log book', isCorrect: true },
      { text: 'Arrange for relief and ensure safe handover', isCorrect: true },
      { text: 'Ignore and continue the watch', isCorrect: false },
      { text: 'Report to the Master immediately', isCorrect: false },
    ],
  },
  {
    id: 3,
    title: 'What does the Deadweight Scale show?',
    type: 'Multiple Choice', topic: 'Operations', dept: 'Deck', rank: 'Master', difficulty: 'Intermediate',
    reviewedBy: 'eDOT Solutions', reviewStatus: 'Reviewed',
    options: [
      { text: 'Displacement by draft', isCorrect: false },
      { text: 'Deadweight by draft', isCorrect: false },
      { text: 'TPI and TPC', isCorrect: false },
      { text: 'All the answers are correct', isCorrect: true },
    ],
  },
];

const STORAGE_KEY = 'qr_questions_v2';

function loadQuestions(): Question[] {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : seedQuestions; } catch { return seedQuestions; }
}
function saveQuestions(qs: Question[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(qs)); }

// ── Stat Ring ──────────────────────────────────────────────────────────────
function StatRing({ count, label, color, icon }: { count: number; label: string; color: string; icon: React.ReactNode }) {
  return (
    <Box sx={{ textAlign: 'center', px: 1 }}>
      <Box sx={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, mx: 'auto', bgcolor: `${color}10` }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={800} color={color}>{count}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function QuestionReviewPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(loadQuestions);
  const [filterType, setFilterType] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterRank, setFilterRank] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterReviewedBy, setFilterReviewedBy] = useState('All');
  const [expandedFilters, setExpandedFilters] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([1, 2, 3]));
  const [progressTab, setProgressTab] = useState<'overall' | 'selection'>('overall');
  const [snackbar, setSnackbar] = useState('');

  const uniqueTypes = [...new Set(questions.map(q => q.type))];
  const uniqueDepts = [...new Set(questions.map(q => q.dept))];
  const uniqueRanks = [...new Set(questions.map(q => q.rank))];
  const uniqueTopics = [...new Set(questions.map(q => q.topic))];

  const displayed = useMemo(() => questions.filter(q => {
    if (filterType !== 'All' && q.type !== filterType) return false;
    if (filterDept !== 'All' && q.dept !== filterDept) return false;
    if (filterRank !== 'All' && q.rank !== filterRank) return false;
    if (filterTopic !== 'All' && q.topic !== filterTopic) return false;
    if (filterStatus !== 'All' && q.reviewStatus !== filterStatus) return false;
    if (filterReviewedBy !== 'All' && q.reviewedBy !== filterReviewedBy) return false;
    return true;
  }), [questions, filterType, filterDept, filterRank, filterTopic, filterStatus, filterReviewedBy]);

  const statsSource = progressTab === 'overall' ? questions : displayed;
  const totalStat = statsSource.length;
  const reviewedStat = statsSource.filter(q => q.reviewStatus === 'Reviewed').length;
  const pendingStat = totalStat - reviewedStat;

  const toggleCard = (id: number) => {
    setExpandedCards(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const markReviewed = (id: number) => {
    const updated = questions.map(q => q.id === id ? { ...q, reviewStatus: 'Reviewed' as const } : q);
    setQuestions(updated); saveQuestions(updated);
    setSnackbar('Question marked as Reviewed ✓');
  };

  const deleteQuestion = (id: number) => {
    if (!window.confirm('Delete this question?')) return;
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated); saveQuestions(updated);
    setSnackbar('Question deleted');
  };

  const updateOptionText = (qId: number, optIdx: number, text: string) => {
    const updated = questions.map(q =>
      q.id === qId ? { ...q, options: q.options.map((o, i) => i === optIdx ? { ...o, text } : o) } : q
    );
    setQuestions(updated); saveQuestions(updated);
  };

  const setCorrectOption = (qId: number, optIdx: number) => {
    const updated = questions.map(q =>
      q.id === qId ? { ...q, options: q.options.map((o, i) => ({ ...o, isCorrect: i === optIdx })) } : q
    );
    setQuestions(updated); saveQuestions(updated);
  };

  const updateField = (qId: number, field: keyof Question, value: string) => {
    const updated = questions.map(q => q.id === qId ? { ...q, [field]: value } : q);
    setQuestions(updated); saveQuestions(updated);
  };

  const FilterDropdown = ({ label, value, setter, opts, 'data-tour-id': tourId }: { label: string; value: string; setter: (v: string) => void; opts: string[]; 'data-tour-id'?: string }) => (
    <Box sx={{ minWidth: 100, flex: 1 }} data-tour-id={tourId}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}:</Typography>
      <FormControl size="small" fullWidth>
        <Select value={value} onChange={e => setter(e.target.value)} displayEmpty sx={{ bgcolor: '#fff', fontSize: '0.82rem' }}>
          {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: '0.82rem' }}>{o}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={800} color="primary.main">Question Review Portal</Typography>
          <Typography variant="body2" color="text.secondary">— Review and validate questions</Typography>
        </Box>
        <Button variant="contained" startIcon={<ArrowBackIcon />}
          sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
          onClick={() => navigate('/dashboard')}
          data-tour-id="qr-back-btn"
        >
          Back to Dashboard
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── LEFT COLUMN ── */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* Filters Card */}
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3, overflow: 'hidden', borderTop: '3px solid #f59e0b' }}>
            <Box
              onClick={() => setExpandedFilters(!expandedFilters)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, cursor: 'pointer', bgcolor: '#fafafa', borderBottom: expandedFilters ? '1px solid #e0e0e0' : 'none' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <FilterAltIcon fontSize="small" />
                <Typography variant="body2" fontWeight={700}>Filters</Typography>
              </Box>
              <Box data-tour-id="qr-expand-filters">
                {expandedFilters ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </Box>
            </Box>

            <Collapse in={expandedFilters}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                  <FilterDropdown label="Question Type:" value={filterType} setter={setFilterType} opts={['All', ...uniqueTypes]} data-tour-id="qr-filter-type" />
                  <FilterDropdown label="Department:" value={filterDept} setter={setFilterDept} opts={['All', ...uniqueDepts]} data-tour-id="qr-filter-dept" />
                  <FilterDropdown label="Rank:" value={filterRank} setter={setFilterRank} opts={['All', ...uniqueRanks]} data-tour-id="qr-filter-rank" />
                  <FilterDropdown label="Topic:" value={filterTopic} setter={setFilterTopic} opts={['All', ...uniqueTopics]} data-tour-id="qr-filter-topic" />
                  <FilterDropdown label="Reviewed Status:" value={filterStatus} setter={setFilterStatus} opts={['All', 'Pending', 'Reviewed']} data-tour-id="qr-filter-status" />
                  <FilterDropdown label="Reviewed By:" value={filterReviewedBy} setter={setFilterReviewedBy} opts={['All', 'eDOT Solutions', 'Internal Team']} data-tour-id="qr-filter-reviewed-by" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Showing <strong>{displayed.length}</strong> of <strong>{questions.length}</strong> questions
                </Typography>
              </Box>
            </Collapse>
          </Paper>

          {/* Question Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {displayed.length === 0 && (
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', p: 5, borderRadius: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No questions match your filters.</Typography>
              </Paper>
            )}

            {displayed.map((q, idx) => {
              const isOpen = expandedCards.has(q.id);
              return (
                <Paper key={q.id} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0', borderLeft: `4px solid ${q.reviewStatus === 'Reviewed' ? '#22c55e' : '#f59e0b'}` }}>
                  {/* Toolbar Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                    <Box sx={{ width: 44, borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                      <Typography variant="caption" fontWeight={800} color="primary.main">Q.{idx + 1}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, flex: 1, flexWrap: 'wrap' }}>
                      {[FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon, FormatListBulletedIcon, FormatListNumberedIcon, FormatQuoteIcon, FormatAlignLeftIcon, UndoIcon, RedoIcon].map((Icon, i) => (
                        <IconButton key={i} size="small" sx={{ color: 'text.secondary' }}><Icon sx={{ fontSize: 15 }} /></IconButton>
                      ))}
                    </Box>
                    <IconButton size="small" onClick={() => toggleCard(q.id)} sx={{ mr: 1, color: 'text.secondary' }}>
                      {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>

                  {/* Always-visible: question title + metadata */}
                  <Box sx={{ px: 3, pt: 2 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>{q.title}</Typography>

                    {/* Metadata inline dropdowns */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                      {[
                        { label: 'Type:', field: 'type' as const, opts: ['Multiple Choice', 'Multiple Response', 'True/False', 'Short Answer'] },
                        { label: 'Topic:', field: 'topic' as const, opts: ['Operations', 'Behavioural', 'Navigation', 'Cargo Handling', 'Safety'] },
                        { label: 'Dept:', field: 'dept' as const, opts: ['Deck', 'Engine'] },
                        { label: 'Rank:', field: 'rank' as const, opts: ['Master', 'Chief Officer', '2nd Officer', '3rd Officer', 'Chief Engineer', '2nd Engineer', '3rd Engineer'] },
                        { label: 'Difficulty:', field: 'difficulty' as const, opts: ['Easy', 'Intermediate', 'Difficult'] },
                      ].map(m => (
                        <Box key={m.field} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">{m.label}</Typography>
                          <FormControl size="small">
                            <Select value={q[m.field]} onChange={e => updateField(q.id, m.field, e.target.value)}
                              sx={{ height: 26, fontSize: '0.75rem', '& .MuiSelect-select': { py: 0.5 } }}
                              data-tour-id={`qr-${m.field}-dropdown-${q.id}`}
                            >
                              {m.opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: '0.75rem' }}>{o}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Box>
                      ))}
                      {q.reviewStatus === 'Reviewed' && (
                        <Chip label="Reviewed" size="small" color="success" sx={{ ml: 'auto', fontWeight: 700 }} />
                      )}
                    </Box>
                  </Box>

                  {/* Collapsible: image upload + answer options + actions */}
                  <Collapse in={isOpen}>
                    <Box sx={{ px: 3, pb: 2 }}>
                      {/* Image Upload */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>Question Image</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Button variant="contained" color="primary" size="small" component="label" sx={{ textTransform: 'none' }}>
                            Choose File<input type="file" accept="image/*" hidden />
                          </Button>
                          <Typography variant="body2" color="text.secondary">No file chosen</Typography>
                        </Box>
                      </Box>

                      {/* Answer Options */}
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1.5 }}>Answer Options</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        {q.options.map((opt, i) => (
                          <Box key={i} sx={{
                            display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 1,
                            border: '1px solid', borderColor: opt.isCorrect ? 'success.main' : '#e0e0e0',
                            bgcolor: opt.isCorrect ? '#e8f5e9' : 'transparent',
                          }}>
                            <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, color: 'text.secondary' }}>{String.fromCharCode(65 + i)}.</Typography>
                            <TextField size="small" fullWidth value={opt.text} onChange={e => updateOptionText(q.id, i, e.target.value)}
                              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', fontSize: '0.85rem' } }} />
                            <IconButton size="small" sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 0.5 }}>
                              <ImageOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setCorrectOption(q.id, i)}>
                              {opt.isCorrect
                                ? <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                : <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 20 }} />}
                            </IconButton>
                          </Box>
                        ))}
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />}
                          sx={{ textTransform: 'none' }} onClick={() => deleteQuestion(q.id)}
                          data-tour-id={`qr-delete-btn-${q.id}`}
                        >
                          Delete
                        </Button>
                        {q.reviewStatus !== 'Reviewed' && (
                          <Button variant="contained" color="success" size="small"
                            sx={{ textTransform: 'none' }} onClick={() => markReviewed(q.id)}
                            data-tour-id={`qr-reviewed-btn-${q.id}`}
                          >
                            Reviewed
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        </Grid>

        {/* ── RIGHT COLUMN: Progress ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, position: 'sticky', top: 80 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>Review Progress</Typography>

              {/* Tab toggle */}
              <Box sx={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', mt: 2 }}>
                {(['overall', 'selection'] as const).map(tab => (
                  <Box key={tab} onClick={() => setProgressTab(tab)} sx={{
                    flex: 1, py: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                    bgcolor: progressTab === tab ? 'primary.main' : 'white',
                    color: progressTab === tab ? 'white' : 'text.secondary',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: progressTab === tab ? 'primary.main' : '#f8fafc' },
                    borderRight: tab === 'overall' ? '1px solid #e0e0e0' : 'none',
                  }} data-tour-id={`qr-progress-tab-${tab}`}>
                    {tab === 'overall' ? 'Overall Progress' : 'Current Selection'}
                  </Box>
                ))}
              </Box>

              {/* Stat circles */}
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4, mb: 1 }}>
                <StatRing count={totalStat} label="Total" color="#3b82f6"
                  icon={<CheckCircleIcon sx={{ color: '#3b82f6', fontSize: 22 }} />} />
                <StatRing count={reviewedStat} label="Reviewed" color="#22c55e"
                  icon={<CheckCircleIcon sx={{ color: '#22c55e', fontSize: 22 }} />} />
                <StatRing count={pendingStat} label="Pending" color="#f59e0b"
                  icon={<AccessTimeIcon sx={{ color: '#f59e0b', fontSize: 22 }} />} />
              </Box>
            </Box>

            {/* By Question Type */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>By Question Type</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {uniqueTypes.map(type => {
                  const src = progressTab === 'overall' ? questions : displayed;
                  const all = src.filter(q => q.type === type);
                  const pend = all.filter(q => q.reviewStatus === 'Pending').length;
                  return (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">{type}</Typography>
                      <Typography variant="body2">
                        <Box component="span" sx={{ color: '#f59e0b', fontWeight: 700 }}>{pend} pending</Box>
                        <Box component="span" color="text.secondary"> / {all.length}</Box>
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
