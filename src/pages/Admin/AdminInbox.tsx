'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
//   Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  AttachFile as AttachFileIcon,
  Inbox as InboxIcon,
  MarkEmailUnread as UnreadIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import {
  useAdminInboxThreads,
  useAdminInboxThread,
  useReplyToThread,
  useUpdateThreadStatus,
  useGetAttachmentUrl,
  type InboxThread,
  type InboxMessage,
  type ThreadStatus,
} from '../../hooks/useInbox';

// ─── Design tokens (matches AdminUsers.tsx) ──────────────────────────────────

const BRAND = '#FA510F';
const BRAND_DARK = '#D94309';
const BRAND_SOFT = '#FFF4F0';

const ink = {
  900: '#0B1220',
  700: '#0F172A',
  600: '#475569',
  400: '#94A3B8',
  300: '#CBD5E1',
  200: '#E2E8F0',
  100: '#F1F5F9',
  50: '#F8FAFC',
};

// const success = { text: '#047857', bg: '#ECFDF5', border: '#A7F3D0' };

const radius = { sm: '10px', md: '12px', lg: '16px', xl: '20px' };
const shadow = {
  card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 0 rgba(15,23,42,0.03)',
  raised: '0 10px 30px rgba(15,23,42,0.10)',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html?: string): string {
  if (!html) return '';
  // Rendered content from inbound emails is untrusted — never dangerouslySetInnerHTML it.
  // We only ever show plain text extracted from tags, never the raw markup.
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function displayBody(msg: InboxMessage): string {
  return msg.text?.trim() || stripHtml(msg.html) || '(no content)';
}

function formatRelative(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function displayName(t: Pick<InboxThread, 'participantName' | 'participantEmail'>) {
  return t.participantName || t.participantEmail;
}

function initials(t: Pick<InboxThread, 'participantName' | 'participantEmail'>) {
  const base = t.participantName || t.participantEmail;
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: '#FFE8DE', fg: BRAND_DARK },
  { bg: '#E4E1FF', fg: '#4C3FD9' },
  { bg: '#DCF3EC', fg: '#0F7A5C' },
  { bg: '#E1EEFB', fg: '#1D6FB8' },
  { bg: '#FBE7F0', fg: '#B23A73' },
  { bg: '#FDF1D6', fg: '#9A6A00' },
];
function avatarStyle(id: string) {
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

// ─── Thread List Item ────────────────────────────────────────────────────────

function ThreadListItem({
  thread,
  selected,
  onSelect,
}: {
  thread: InboxThread;
  selected: boolean;
  onSelect: () => void;
}) {
  const avatar = avatarStyle(thread._id);
  const unread = thread.unreadCount > 0;

  return (
    <Box
      onClick={onSelect}
      sx={{
        p: 1.6,
        cursor: 'pointer',
        borderRadius: radius.md,
        bgcolor: selected ? BRAND_SOFT : 'transparent',
        border: `1px solid ${selected ? '#FFD9C7' : 'transparent'}`,
        display: 'flex',
        gap: 1.2,
        alignItems: 'flex-start',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: selected ? BRAND_SOFT : ink[50] },
      }}
    >
      <Avatar sx={{ bgcolor: avatar.bg, color: avatar.fg, width: 36, height: 36, fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, mt: 0.2 }}>
        {initials(thread)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '0.84rem',
              fontWeight: unread ? 800 : 600,
              color: ink[900],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName(thread)}
          </Typography>
          <Typography sx={{ fontSize: '0.66rem', color: ink[400], flexShrink: 0 }}>
            {formatRelative(thread.lastMessageAt)}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '0.76rem',
            fontWeight: unread ? 700 : 500,
            color: unread ? ink[700] : ink[600],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {thread.subject}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: ink[400],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {thread.lastMessageDirection === 'outbound' ? 'You: ' : ''}
          {thread.lastMessageSnippet || '(no preview)'}
        </Typography>
      </Box>
      {unread && (
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: BRAND, flexShrink: 0, mt: 0.6 }} />
      )}
    </Box>
  );
}

function ThreadListSkeleton() {
  return (
    <Box sx={{ p: 1.6, display: 'flex', gap: 1.2 }}>
      <Skeleton variant="circular" width={36} height={36} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="90%" height={14} />
      </Box>
    </Box>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────


function MessageBubble({ message }: { message: InboxMessage }) {
  const isOutbound = message.direction === 'outbound';
  const getAttachmentUrl = useGetAttachmentUrl();
  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleOpenAttachment = async (attachmentId?: string) => {
    if (!attachmentId) return;
    setOpeningId(attachmentId);
    try {
      const { downloadUrl } = await getAttachmentUrl.mutateAsync({ messageId: message._id, attachmentId });
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Silently ignored here — the chip just won't open; add a snackbar if you want feedback.
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: isOutbound ? 'flex-end' : 'flex-start', mb: 1.6 }}>
      <Box sx={{ maxWidth: '78%' }}>
        <Box
          sx={{
            p: 1.6,
            borderRadius: radius.lg,
            bgcolor: isOutbound ? BRAND : '#fff',
            color: isOutbound ? '#fff' : ink[900],
            border: isOutbound ? 'none' : `1px solid ${ink[200]}`,
            boxShadow: shadow.card,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.86rem',
            lineHeight: 1.55,
          }}
        >
          {displayBody(message)}
        </Box>
        {message.attachments.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 0.8, justifyContent: isOutbound ? 'flex-end' : 'flex-start' }}>
            {message.attachments.map((a, i) => (
              <Chip
                key={i}
                size="small"
                clickable={!!a.resendAttachmentId}
                onClick={() => handleOpenAttachment(a.resendAttachmentId)}
                icon={
                  openingId === a.resendAttachmentId ? (
                    <CircularProgress size={12} sx={{ ml: '6px !important' }} />
                  ) : (
                    <AttachFileIcon sx={{ fontSize: '0.9rem !important' }} />
                  )
                }
                label={a.filename}
                sx={{ bgcolor: ink[50], color: ink[600], fontSize: '0.68rem', height: 22 }}
              />
            ))}
          </Box>
        )}
        <Typography sx={{ fontSize: '0.66rem', color: ink[400], mt: 0.5, textAlign: isOutbound ? 'right' : 'left' }}>
          {isOutbound ? 'You' : message.fromName || message.fromEmail} · {formatFullTime(message.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Empty States ────────────────────────────────────────────────────────────

function NoThreadSelected() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.2 }}>
      <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: ink[100], display: 'grid', placeItems: 'center' }}>
        <InboxIcon sx={{ fontSize: '1.4rem', color: ink[400] }} />
      </Box>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: ink[700] }}>Select a conversation</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: ink[400] }}>Choose a thread from the list to read and reply.</Typography>
    </Box>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminInbox() {
  const [statusFilter, setStatusFilter] = useState<ThreadStatus | 'all'>('open');
  const [search, setSearch] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: listData, isLoading: listLoading, isError: listError } = useAdminInboxThreads(statusFilter, 1, search);
  const threads = listData?.data ?? [];

  const { data: threadData, isLoading: threadLoading } = useAdminInboxThread(selectedThreadId);
  const reply = useReplyToThread();
  const updateStatus = useUpdateThreadStatus();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadData?.messages.length]);

  // If the selected thread's status filter no longer matches (e.g. it was
  // just closed and we're viewing "Open"), keep it selected — don't yank
  // the conversation out from under the admin mid-reply.

  const handleSend = async () => {
    if (!replyText.trim() || !selectedThreadId) return;
    try {
      await reply.mutateAsync({ threadId: selectedThreadId, message: replyText.trim() });
      setReplyText('');
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to send reply',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!threadData) return;
    const next: ThreadStatus = threadData.thread.status === 'open' ? 'closed' : 'open';
    try {
      await updateStatus.mutateAsync({ threadId: threadData.thread._id, status: next });
      setSnackbar({ open: true, message: `Thread marked ${next}`, severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update thread',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 0, fontFamily: 'inherit' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink[400], textTransform: 'uppercase', letterSpacing: '0.6px', mb: 0.6 }}>
          Admin · Inbox
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 900, color: ink[900], letterSpacing: '-0.02em' }}>
          Inbox
        </Typography>
        <Typography sx={{ fontSize: '0.92rem', color: ink[600], mt: 0.4 }}>
          Emails sent to your support address, ready to reply to directly.
        </Typography>
      </Box>

      {listError && (
        <Alert severity="error" sx={{ borderRadius: radius.md, mb: 2 }}>
          Failed to load your inbox. Please try again.
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          height: 'calc(100vh - 260px)',
          minHeight: 480,
        }}
      >
        {/* Left pane: thread list */}
        <Box
          sx={{
            width: { xs: '100%', md: 340 },
            flexShrink: 0,
            display: { xs: selectedThreadId ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            border: `1px solid ${ink[200]}`,
            borderRadius: radius.lg,
            bgcolor: '#fff',
            boxShadow: shadow.card,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1.6, borderBottom: `1px solid ${ink[100]}` }}>
            <TextField
              placeholder="Search inbox…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 1.2, '& .MuiOutlinedInput-root': { borderRadius: radius.md } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: '1.05rem', color: ink[400] }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(_, val) => val && setStatusFilter(val)}
            >
              <ToggleButton
                value="open"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: `${radius.sm} !important`,
                  color: ink[600],
                  '&.Mui-selected': { bgcolor: BRAND_SOFT, color: BRAND_DARK },
                }}
              >
                Open
              </ToggleButton>
              <ToggleButton
                value="closed"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: `${radius.sm} !important`,
                  color: ink[600],
                  '&.Mui-selected': { bgcolor: ink[100], color: ink[900] },
                }}
              >
                Closed
              </ToggleButton>
              <ToggleButton
                value="all"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: `${radius.sm} !important`,
                  color: ink[600],
                  '&.Mui-selected': { bgcolor: ink[100], color: ink[900] },
                }}
              >
                All
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {listLoading &&
              Array.from({ length: 6 }).map((_, i) => <ThreadListSkeleton key={`skeleton-${i}`} />)}

            {!listLoading && threads.length === 0 && (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <UnreadIcon sx={{ fontSize: '1.3rem', color: ink[300] }} />
                <Typography sx={{ fontSize: '0.8rem', color: ink[400] }}>No conversations here</Typography>
              </Box>
            )}

            {!listLoading &&
              threads.map((t) => (
                <ThreadListItem
                  key={t._id}
                  thread={t}
                  selected={t._id === selectedThreadId}
                  onSelect={() => setSelectedThreadId(t._id)}
                />
              ))}
          </Box>
        </Box>

        {/* Right pane: conversation */}
        <Box
          sx={{
            flex: 1,
            display: { xs: selectedThreadId ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            border: `1px solid ${ink[200]}`,
            borderRadius: radius.lg,
            bgcolor: ink[50],
            boxShadow: shadow.card,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {!selectedThreadId && <NoThreadSelected />}

          {selectedThreadId && (
            <>
              {/* Thread header */}
              <Box
                sx={{
                  p: 1.8,
                  bgcolor: '#fff',
                  borderBottom: `1px solid ${ink[100]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {threadLoading || !threadData ? (
                  <Skeleton variant="text" width={220} height={26} />
                ) : (
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      component="button"
                      onClick={() => setSelectedThreadId(null)}
                      sx={{
                        display: { xs: 'inline', md: 'none' },
                        border: 'none',
                        background: 'none',
                        color: BRAND,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        mb: 0.4,
                        p: 0,
                        cursor: 'pointer',
                      }}
                    >
                      ← Back
                    </Box>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: ink[900] }}>
                      {displayName(threadData.thread)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: ink[400] }}>
                      {threadData.thread.participantEmail} · {threadData.thread.subject}
                    </Typography>
                  </Box>
                )}

                {threadData && (
                  <Tooltip title={threadData.thread.status === 'open' ? 'Close thread' : 'Reopen thread'}>
                    <span>
                      <IconButton
                        onClick={handleToggleStatus}
                        disabled={updateStatus.isPending}
                        size="small"
                        sx={{ border: `1px solid ${ink[200]}`, borderRadius: radius.sm }}
                      >
                        {threadData.thread.status === 'open' ? (
                          <ArchiveIcon sx={{ fontSize: '1.05rem', color: ink[600] }} />
                        ) : (
                          <UnarchiveIcon sx={{ fontSize: '1.05rem', color: ink[600] }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.6, sm: 2.4 } }}>
                {threadLoading && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                    <Skeleton variant="rounded" width="60%" height={60} />
                    <Skeleton variant="rounded" width="55%" height={50} sx={{ alignSelf: 'flex-end' }} />
                  </Box>
                )}

                {!threadLoading &&
                  threadData?.messages.map((m) => <MessageBubble key={m._id} message={m} />)}

                <div ref={messagesEndRef} />
              </Box>

              {/* Reply composer */}
              <Box sx={{ p: 1.6, bgcolor: '#fff', borderTop: `1px solid ${ink[100]}` }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={6}
                    placeholder="Write a reply…"
                    value={replyText}
                    disabled={reply.isPending}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md } }}
                  />
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSend}
                    disabled={reply.isPending || !replyText.trim()}
                    startIcon={
                      reply.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: '1.05rem' }} />
                    }
                    sx={{
                      bgcolor: BRAND,
                      color: '#fff',
                      px: 2.4,
                      py: 1.5,
                      borderRadius: radius.md,
                      fontWeight: 700,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: BRAND_DARK },
                      '&.Mui-disabled': { bgcolor: ink[300], color: '#fff' },
                    }}
                  >
                    Send
                  </Button>
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: ink[400], mt: 0.6 }}>
                  ⌘/Ctrl + Enter to send
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: radius.md, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}