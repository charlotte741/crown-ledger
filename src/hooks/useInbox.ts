import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClientBackend';

export type ThreadStatus = 'open' | 'closed';

export interface InboxThread {
  _id: string;
  participantEmail: string;
  participantName?: string;
  subject: string;
  status: ThreadStatus;
  lastMessageAt: string;
  lastMessageSnippet: string;
  lastMessageDirection: 'inbound' | 'outbound';
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InboxAttachment {
  filename: string;
  contentType: string;
  size?: number;
  resendAttachmentId?: string;
}

export interface InboxMessage {
  _id: string;
  threadId: string;
  direction: 'inbound' | 'outbound';
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  text?: string;
  html?: string;
  attachments: InboxAttachment[];
  sentByAdminId?: string;
  read: boolean;
  createdAt: string;
}

interface ListThreadsResponse {
  success: boolean;
  message?: string;
  data: InboxThread[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// ─── List Threads Hook ─────────────────────────────────────────────────────
export const useAdminInboxThreads = (
  status: ThreadStatus | 'all' = 'open',
  page = 1,
  searchQuery = '',
  limit = 20
) => {
  return useQuery({
    queryKey: ['admin-inbox-threads', status, page, searchQuery, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchQuery) params.set('searchQuery', searchQuery);

      const response = (await apiClient(`admin/inbox?${params.toString()}`, {
        method: 'GET',
      })) as ListThreadsResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch inbox threads');
      }

      return response;
    },
    // Light polling so new inbound emails show up without a manual refresh.
    // Swap for a websocket/SSE push later if you want true real-time.
    refetchInterval: 20_000,
  });
};

interface GetThreadResponse {
  success: boolean;
  message?: string;
  data: { thread: InboxThread; messages: InboxMessage[] };
}

// ─── Get Single Thread Hook ────────────────────────────────────────────────
export const useAdminInboxThread = (threadId: string | null) => {
  return useQuery({
    queryKey: ['admin-inbox-thread', threadId],
    queryFn: async () => {
      const response = (await apiClient(`admin/inbox/${threadId}`, {
        method: 'GET',
      })) as GetThreadResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch thread');
      }

      return response.data;
    },
    enabled: !!threadId,
    refetchInterval: threadId ? 15_000 : false,
  });
};

interface ReplyPayload {
  threadId: string;
  message: string;
  subject?: string;
}

interface ReplyResponse {
  success: boolean;
  message: string;
}

// ─── Reply To Thread Hook ──────────────────────────────────────────────────
export const useReplyToThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, ...payload }: ReplyPayload) => {
      const response = (await apiClient(`admin/inbox/${threadId}/reply`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as ReplyResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to send reply');
      }

      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inbox-thread', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['admin-inbox-threads'] });
    },
  });
};

interface UpdateStatusPayload {
  threadId: string;
  status: ThreadStatus;
}

interface UpdateStatusResponse {
  success: boolean;
  message?: string;
  data: InboxThread;
}

// ─── Open/Close Thread Hook ────────────────────────────────────────────────
export const useUpdateThreadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, status }: UpdateStatusPayload) => {
      const response = (await apiClient(`admin/inbox/${threadId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })) as UpdateStatusResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update thread status');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inbox-thread', data._id] });
      queryClient.invalidateQueries({ queryKey: ['admin-inbox-threads'] });
    },
  });
};

interface AttachmentUrlResponse {
  success: boolean;
  message?: string;
  data: { filename: string; contentType: string; downloadUrl: string; expiresAt: string };
}

// ─── Get Attachment Download URL Hook ──────────────────────────────────────
export const useGetAttachmentUrl = () => {
  return useMutation({
    mutationFn: async ({ messageId, attachmentId }: { messageId: string; attachmentId: string }) => {
      const response = (await apiClient(
        `admin/inbox/messages/${messageId}/attachments/${attachmentId}`,
        { method: 'GET' }
      )) as AttachmentUrlResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch attachment');
      }

      return response.data;
    },
  });
};