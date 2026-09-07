/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-pattern */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  // Switch,
  TextField,
  Button,
  Avatar,
  useMediaQuery,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Skeleton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  LockOutlined as LockIcon,
  // NotificationsOutlined as BellIcon,
  // SecurityOutlined as ShieldIcon,
  HelpOutlined as HelpIcon,
  LogoutOutlined as LogoutIcon,
  KeyboardArrowRight as ArrowIcon,
  CheckCircle as CheckIcon,
  PhoneAndroid as DeviceIcon,
  EmailOutlined as EmailIcon,
  PersonOutlined as PersonIcon,
  CakeOutlined as CakeIcon,
  WarningAmberOutlined as WarnIcon,
  // DeleteOutlined as DeleteIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Refresh as RetakeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  AttachFile as AttachFileIcon,
  BugReportOutlined as BugReportIcon,
  SendOutlined as SendIcon,
  InsertDriveFileOutlined as FileIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswerOutlined as FaqIcon,
} from '@mui/icons-material';
import {
  useGetProfile,
  useUpdateProfileDetails,
  useUploadProfilePhoto,
} from '../../hooks/useProfile'; 
import { useChangePassword, useCreateSupportTicket } from '../../hooks/useAuth';// adjust path as needed
import { useAuth } from '../../contexts/AuthContext';

// ─── Reusable section wrapper ─────────────────────────────────────────────────
function Section({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
      <Typography sx={{
        fontSize: '0.68rem', fontWeight: 800, color: '#FA510F',
        letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1.2,
      }}>
        {label}
      </Typography>
      <Box sx={{
        borderRadius: '20px',
        bgcolor: '#fff',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Row for action buttons ───────────────────────────────────────────────────
function ActionRow({
  icon, title, subtitle, action, danger = false,
}: {
  icon: React.ReactNode; title: string; subtitle: string;
  action: React.ReactNode; actionColor?: string; danger?: boolean;
}) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center',
      px: { xs: 2, sm: 2.5 }, py: { xs: 1.8, sm: 2 }, gap: 2,
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      '&:last-child': { borderBottom: 'none' },
      bgcolor: danger ? 'rgba(220,38,38,0.02)' : 'transparent',
      transition: 'background 0.15s',
      '&:hover': { bgcolor: danger ? 'rgba(220,38,38,0.04)' : '#FAFBFC' },
    }}>
      <Box sx={{
        width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
        bgcolor: danger ? '#FEF2F2' : '#F8F9FA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ color: danger ? '#DC2626' : '#6B7280', display: 'flex', fontSize: '1.1rem' }}>{icon}</Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: danger ? '#DC2626' : '#0F172A', lineHeight: 1.3 }}>{title}</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2, lineHeight: 1.4 }}>{subtitle}</Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>{action}</Box>
    </Box>
  );
}

// ─── Row for toggle switches ──────────────────────────────────────────────────
// function ToggleRow({
//   icon, title, subtitle, checked, onChange,
// }: {
//   icon: React.ReactNode; title: string; subtitle: string;
//   checked: boolean; onChange: (v: boolean) => void;
// }) {
//   return (
//     <Box sx={{
//       display: 'flex', alignItems: 'center',
//       px: { xs: 2, sm: 2.5 }, py: { xs: 1.8, sm: 2 }, gap: 2,
//       borderBottom: '1px solid rgba(0,0,0,0.05)',
//       '&:last-child': { borderBottom: 'none' },
//       transition: 'background 0.15s',
//       '&:hover': { bgcolor: '#FAFBFC' }, cursor: 'pointer',
//     }}
//     onClick={() => onChange(!checked)}
//     >
//       <Box sx={{
//         width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
//         bgcolor: checked ? '#FFF4F0' : '#F8F9FA',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         transition: 'background 0.2s',
//       }}>
//         <Box sx={{ color: checked ? '#FA510F' : '#9CA3AF', display: 'flex', fontSize: '1.1rem', transition: 'color 0.2s' }}>{icon}</Box>
//       </Box>
//       <Box sx={{ flex: 1, minWidth: 0 }}>
//         <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{title}</Typography>
//         <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2, lineHeight: 1.4 }}>{subtitle}</Typography>
//       </Box>
//       <Switch
//         checked={checked}
//         onChange={e => { e.stopPropagation(); onChange(e.target.checked); }}
//         size="small"
//         sx={{
//           flexShrink: 0,
//           '& .MuiSwitch-switchBase.Mui-checked': { color: '#FA510F' },
//           '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#FA510F' },
//         }}
//       />
//     </Box>
//   );
// }

// ─── Profile field row ────────────────────────────────────────────────────────
function FieldRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center',
      px: { xs: 2, sm: 2.5 }, py: { xs: 1.6, sm: 1.8 }, gap: 2,
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{ color: '#9CA3AF', display: 'flex', fontSize: '1rem', flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</Typography>
      </Box>
    </Box>
  );
}

// ─── Profile field skeleton ───────────────────────────────────────────────────
function FieldRowSkeleton() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 2, sm: 2.5 }, py: { xs: 1.6, sm: 1.8 }, gap: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <Skeleton variant="circular" width={20} height={20} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="30%" height={12} />
        <Skeleton variant="text" width="60%" height={18} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
  );
}

// ─── Avatar Upload Dialog ──────────────────────────────────────────────────────
function AvatarUploadDialog({
  open, onClose, onSave, currentImage, isUploading,
}: {
  open: boolean; onClose: () => void;
  onSave: (url: string) => void;
  currentImage: string | null;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSave = () => {
    if (preview) onSave(preview);
  };

  const handleClose = () => {
    if (isUploading) return;
    onClose();
    setPreview(null);
    setError('');
  };

  // Reset preview when dialog closes
  const handleDialogClose = () => {
    if (!isUploading) {
      setPreview(null);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 }, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Update Profile Photo</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>JPG, PNG, GIF or WebP · Max 5 MB</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={isUploading} sx={{ bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {preview ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={preview}
                sx={{
                  width: 120, height: 120,
                  boxShadow: '0 12px 40px rgba(250,81,15,0.2)',
                  border: '3px solid #FA510F',
                }}
              />
              <Box sx={{
                position: 'absolute', bottom: 4, right: 4,
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: '#059669', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckIcon sx={{ fontSize: '0.85rem', color: '#fff' }} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
              Looking good! Ready to save.
            </Typography>
            <Box
              component="button"
              onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              disabled={isUploading}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.6,
                border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 700,
                '&:hover': { color: '#FA510F' }, transition: 'color 0.15s',
                '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
              }}
            >
              <RetakeIcon sx={{ fontSize: '0.9rem' }} />
              Choose a different photo
            </Box>
          </Box>
        ) : (
          <Box
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragOver ? '#FA510F' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: '16px',
              bgcolor: dragOver ? '#FFF4F0' : '#FAFBFC',
              py: 4, px: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { border: '2px dashed #FA510F', bgcolor: '#FFF4F0' },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={currentImage ?? undefined}
                sx={{
                  width: 80, height: 80,
                  background: 'linear-gradient(135deg,#FA510F,#D94309)',
                  fontSize: '1.8rem', fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(250,81,15,0.2)',
                }}
              >
                JD
              </Avatar>
              <Box sx={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CameraIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', mb: 0.3 }}>
                {dragOver ? 'Drop to upload' : 'Click or drag & drop'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                Your photo will be cropped to a circle
              </Typography>
            </Box>

            <Box sx={{
              px: 2, py: 0.8, borderRadius: '10px',
              background: 'linear-gradient(135deg,#FA510F,#D94309)',
              display: 'flex', alignItems: 'center', gap: 0.6,
            }}>
              <UploadIcon sx={{ color: '#fff', fontSize: '0.9rem' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>Browse Files</Typography>
            </Box>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {error && (
          <Box sx={{ px: 2, py: 1.2, borderRadius: '10px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626' }}>{error}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Button
            fullWidth variant="outlined" onClick={handleClose} disabled={isUploading}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              borderColor: 'rgba(0,0,0,0.12)', color: '#374151', py: 1.2,
              '&:hover': { bgcolor: '#F8F9FA', borderColor: 'rgba(0,0,0,0.2)' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth variant="contained" disabled={!preview || isUploading} onClick={handleSave}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2,
              background: preview && !isUploading ? 'linear-gradient(135deg,#FA510F,#D94309)' : undefined,
              boxShadow: preview && !isUploading ? '0 4px 14px rgba(250,81,15,0.3)' : 'none',
              '&:not(:disabled):hover': { background: 'linear-gradient(135deg,#D94309,#B33000)' },
            }}
          >
            {isUploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                Uploading…
              </Box>
            ) : 'Save Photo'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Password strength helper ─────────────────────────────────────────────────
function getPasswordStrength(password: string): { label: string; color: string; score: number } {
  if (!password) return { label: '', color: '#E5E7EB', score: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Weak', color: '#DC2626', score };
  if (score <= 3) return { label: 'Fair', color: '#D97706', score };
  if (score === 4) return { label: 'Good', color: '#059669', score };
  return { label: 'Strong', color: '#059669', score };
}

// ─── Password input with show/hide toggle ─────────────────────────────────────
function PasswordField({
  label, value, onChange, autoFocus = false, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  autoFocus?: boolean; error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      size="small"
      label={label}
      value={value}
      type={visible ? 'text' : 'password'}
      fullWidth
      autoFocus={autoFocus}
      error={!!error}
      helperText={error || ' '}
      onChange={e => onChange(e.target.value)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setVisible(v => !v)}
                edge="end"
                tabIndex={-1}
                sx={{ color: '#9CA3AF' }}
              >
                {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px', fontSize: '0.88rem',
          '&.Mui-focused fieldset': { borderColor: '#FA510F' },
        },
        '& label.Mui-focused': { color: '#FA510F' },
        '& .MuiFormHelperText-root': { fontSize: '0.68rem', ml: 0.3 },
      }}
    />
  );
}

// ─── Change Password Dialog ───────────────────────────────────────────────────
function ChangePasswordDialog({
  open, onClose, onSubmit, isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<void> | void;
  isSubmitting: boolean;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ old?: string; next?: string; confirm?: string }>({});
  const [formError, setFormError] = useState('');

  const strength = getPasswordStrength(newPassword);

  const resetState = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setFormError('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  const validate = () => {
    const errors: { old?: string; next?: string; confirm?: string } = {};

    if (!oldPassword) errors.old = 'Enter your current password';

    if (!newPassword) {
      errors.next = 'Enter a new password';
    } else if (newPassword.length < 8) {
      errors.next = 'Must be at least 8 characters';
    } else if (oldPassword && newPassword === oldPassword) {
      errors.next = 'New password must differ from the old one';
    }

    if (!confirmPassword) {
      errors.confirm = 'Confirm your new password';
    } else if (confirmPassword !== newPassword) {
      errors.confirm = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!validate()) return;
    try {
      await onSubmit({ oldPassword, newPassword, confirmPassword });
      resetState();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to change password. Please try again.';
      setFormError(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 }, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
            bgcolor: '#FFF4F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LockResetIcon sx={{ color: '#FA510F', fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Change Password</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>Keep your account secure</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={isSubmitting} sx={{ bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }} onKeyDown={handleKeyDown}>

        <PasswordField
          label="Current Password"
          value={oldPassword}
          onChange={v => { setOldPassword(v); setFieldErrors(f => ({ ...f, old: undefined })); }}
          autoFocus
          error={fieldErrors.old}
        />

        <Box>
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={v => { setNewPassword(v); setFieldErrors(f => ({ ...f, next: undefined })); }}
            error={fieldErrors.next}
          />
          {newPassword && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1, mb: 0.5, px: 0.3 }}>
              <Box sx={{ flex: 1, height: 4, borderRadius: '4px', bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                <Box sx={{
                  height: '100%',
                  width: `${Math.min(strength.score, 5) * 20}%`,
                  bgcolor: strength.color,
                  transition: 'width 0.2s ease, background 0.2s ease',
                }} />
              </Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: strength.color, minWidth: 42, textAlign: 'right' }}>
                {strength.label}
              </Typography>
            </Box>
          )}
        </Box>

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={v => { setConfirmPassword(v); setFieldErrors(f => ({ ...f, confirm: undefined })); }}
          error={fieldErrors.confirm}
        />

        <Box sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1,
          px: 1.5, py: 1.2, borderRadius: '12px', bgcolor: '#F8F9FA', mt: -0.5,
        }}>
          <LockIcon sx={{ fontSize: '0.85rem', color: '#9CA3AF', mt: 0.1 }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.5 }}>
            Use at least 8 characters, mixing uppercase, lowercase, numbers and symbols for a stronger password.
          </Typography>
        </Box>

        {formError && (
          <Box sx={{ px: 2, py: 1.2, borderRadius: '10px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626' }}>{formError}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 0.5 }}>
          <Button
            fullWidth variant="outlined" onClick={handleClose} disabled={isSubmitting}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              borderColor: 'rgba(0,0,0,0.12)', color: '#374151', py: 1.2,
              '&:hover': { bgcolor: '#F8F9FA', borderColor: 'rgba(0,0,0,0.2)' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth variant="contained" disabled={isSubmitting} onClick={handleSubmit}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2,
              background: !isSubmitting ? 'linear-gradient(135deg,#FA510F,#D94309)' : undefined,
              boxShadow: !isSubmitting ? '0 4px 14px rgba(250,81,15,0.3)' : 'none',
              '&:not(:disabled):hover': { background: 'linear-gradient(135deg,#D94309,#B33000)' },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                Updating…
              </Box>
            ) : 'Update Password'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Shared select styling ─────────────────────────────────────────────────────
const selectSx = {
  borderRadius: '12px', fontSize: '0.88rem',
  '&.Mui-focused fieldset': { borderColor: '#FA510F' },
};
const selectLabelSx = { '& label.Mui-focused': { color: '#FA510F' } };

// ─── Contact Support Dialog ────────────────────────────────────────────────────
const SUPPORT_TOPICS = ['Account', 'Billing & Payments', 'Transactions', 'Technical Issue', 'Other'];

function ContactSupportDialog({
  open, onClose, onSubmit, isSubmitting, defaultEmail,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { topic: string; subject: string; message: string }) => Promise<void> | void;
  isSubmitting: boolean;
  defaultEmail?: string;
}) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ topic?: string; subject?: string; message?: string }>({});
  const [formError, setFormError] = useState('');

  const resetState = () => {
    setTopic('');
    setSubject('');
    setMessage('');
    setFieldErrors({});
    setFormError('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  const validate = () => {
    const errors: { topic?: string; subject?: string; message?: string } = {};
    if (!topic) errors.topic = 'Select a topic';
    if (!subject.trim()) errors.subject = 'Enter a subject';
    if (!message.trim()) {
      errors.message = 'Tell us how we can help';
    } else if (message.trim().length < 10) {
      errors.message = 'Please provide a bit more detail';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!validate()) return;
    try {
      await onSubmit({ topic, subject: subject.trim(), message: message.trim() });
      resetState();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send your message. Please try again.';
      setFormError(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 }, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
            bgcolor: '#FFF4F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EmailIcon sx={{ color: '#FA510F', fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Contact Support</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>We usually reply within 24 hours</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={isSubmitting} sx={{ bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.8 }}>

        {defaultEmail && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 1, borderRadius: '12px', bgcolor: '#F8F9FA',
          }}>
            <EmailIcon sx={{ fontSize: '0.85rem', color: '#9CA3AF' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
              We'll reply to <span style={{ fontWeight: 700, color: '#0F172A' }}>{defaultEmail}</span>
            </Typography>
          </Box>
        )}

        <FormControl size="small" fullWidth error={!!fieldErrors.topic} sx={selectLabelSx}>
          <InputLabel>Topic</InputLabel>
          <Select
            value={topic}
            label="Topic"
            onChange={e => { setTopic(e.target.value); setFieldErrors(f => ({ ...f, topic: undefined })); }}
            sx={{ '& .MuiOutlinedInput-notchedOutline': {}, ...selectSx }}
          >
            {SUPPORT_TOPICS.map(t => (
              <MenuItem key={t} value={t} sx={{ fontSize: '0.88rem' }}>{t}</MenuItem>
            ))}
          </Select>
          {fieldErrors.topic && (
            <Typography sx={{ fontSize: '0.68rem', color: '#DC2626', mt: 0.5, ml: 1.7 }}>{fieldErrors.topic}</Typography>
          )}
        </FormControl>

        <TextField
          size="small"
          label="Subject"
          value={subject}
          fullWidth
          error={!!fieldErrors.subject}
          helperText={fieldErrors.subject || ' '}
          onChange={e => { setSubject(e.target.value); setFieldErrors(f => ({ ...f, subject: undefined })); }}
          sx={{
            '& .MuiOutlinedInput-root': selectSx,
            ...selectLabelSx,
            '& .MuiFormHelperText-root': { fontSize: '0.68rem', ml: 0.3 },
          }}
        />

        <TextField
  size="small"
  label="How can we help?"
  value={message}
  fullWidth
  multiline
  minRows={4}
  maxRows={7}
  error={!!fieldErrors.message}
  helperText={fieldErrors.message || `${message.length}/1000`}
  slotProps={{
    htmlInput: {
      maxLength: 1000,
    },
  }}
  onChange={(e) => {
    setMessage(e.target.value);
    setFieldErrors((f) => ({
      ...f,
      message: undefined,
    }));
  }}
  sx={{
    '& .MuiOutlinedInput-root': selectSx,
    ...selectLabelSx,
    '& .MuiFormHelperText-root': {
      fontSize: '0.68rem',
      ml: 0.3,
      textAlign: 'right',
    },
  }}
/>

        {formError && (
          <Box sx={{ px: 2, py: 1.2, borderRadius: '10px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626' }}>{formError}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 0.5 }}>
          <Button
            fullWidth variant="outlined" onClick={handleClose} disabled={isSubmitting}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              borderColor: 'rgba(0,0,0,0.12)', color: '#374151', py: 1.2,
              '&:hover': { bgcolor: '#F8F9FA', borderColor: 'rgba(0,0,0,0.2)' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth variant="contained" disabled={isSubmitting} onClick={handleSubmit}
            startIcon={!isSubmitting ? <SendIcon sx={{ fontSize: '0.9rem' }} /> : undefined}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2,
              background: !isSubmitting ? 'linear-gradient(135deg,#FA510F,#D94309)' : undefined,
              boxShadow: !isSubmitting ? '0 4px 14px rgba(250,81,15,0.3)' : 'none',
              '&:not(:disabled):hover': { background: 'linear-gradient(135deg,#D94309,#B33000)' },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                Sending…
              </Box>
            ) : 'Send Message'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Report a Problem Dialog ───────────────────────────────────────────────────
const ISSUE_TYPES = ['Bug / Glitch', 'Payment Issue', 'Login Issue', 'Incorrect Data', 'Other'];
const SEVERITY_LEVELS: { value: 'Low' | 'Medium' | 'High'; color: string; bg: string }[] = [
  { value: 'Low', color: '#059669', bg: '#ECFDF5' },
  { value: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  { value: 'High', color: '#DC2626', bg: '#FEF2F2' },
];

function ReportProblemDialog({
  open, onClose, onSubmit, isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { issueType: string; severity: string; description: string; attachment: File | null }) => Promise<void> | void;
  isSubmitting: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issueType, setIssueType] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ issueType?: string; description?: string; attachment?: string }>({});
  const [formError, setFormError] = useState('');

  const resetState = () => {
    setIssueType('');
    setSeverity('Medium');
    setDescription('');
    setAttachment(null);
    setFieldErrors({});
    setFormError('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFieldErrors(f => ({ ...f, attachment: 'File must be under 10 MB' }));
      return;
    }
    setFieldErrors(f => ({ ...f, attachment: undefined }));
    setAttachment(file);
  };

  const validate = () => {
    const errors: { issueType?: string; description?: string } = {};
    if (!issueType) errors.issueType = 'Select an issue type';
    if (!description.trim()) {
      errors.description = 'Describe the problem you ran into';
    } else if (description.trim().length < 10) {
      errors.description = 'Please provide a bit more detail';
    }
    setFieldErrors(f => ({ ...f, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!validate()) return;
    try {
      await onSubmit({ issueType, severity, description: description.trim(), attachment });
      resetState();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit your report. Please try again.';
      setFormError(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 }, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
            bgcolor: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BugReportIcon sx={{ color: '#DC2626', fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Report a Problem</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>Help us fix what went wrong</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={isSubmitting} sx={{ bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.8 }}>

        <FormControl size="small" fullWidth error={!!fieldErrors.issueType} sx={selectLabelSx}>
          <InputLabel>Issue Type</InputLabel>
          <Select
            value={issueType}
            label="Issue Type"
            onChange={e => { setIssueType(e.target.value); setFieldErrors(f => ({ ...f, issueType: undefined })); }}
            sx={selectSx}
          >
            {ISSUE_TYPES.map(t => (
              <MenuItem key={t} value={t} sx={{ fontSize: '0.88rem' }}>{t}</MenuItem>
            ))}
          </Select>
          {fieldErrors.issueType && (
            <Typography sx={{ fontSize: '0.68rem', color: '#DC2626', mt: 0.5, ml: 1.7 }}>{fieldErrors.issueType}</Typography>
          )}
        </FormControl>

        {/* Severity chips */}
        <Box>
          <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8 }}>
            Severity
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {SEVERITY_LEVELS.map(level => {
              const selected = severity === level.value;
              return (
                <Chip
                  key={level.value}
                  label={level.value}
                  onClick={() => setSeverity(level.value)}
                  sx={{
                    fontWeight: 700, fontSize: '0.75rem', borderRadius: '10px', flex: 1,
                    bgcolor: selected ? level.bg : '#F8F9FA',
                    color: selected ? level.color : '#9CA3AF',
                    border: selected ? `1.5px solid ${level.color}` : '1.5px solid transparent',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: level.bg, color: level.color },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <TextField
  size="small"
  label="Describe the problem"
  value={description}
  fullWidth
  multiline
  minRows={4}
  maxRows={7}
  error={!!fieldErrors.description}
  helperText={fieldErrors.description || `${description.length}/1000`}
  slotProps={{
    htmlInput: {
      maxLength: 1000,
    },
  }}
  placeholder="What happened? What did you expect to happen instead?"
  onChange={(e) => {
    setDescription(e.target.value);
    setFieldErrors((f) => ({
      ...f,
      description: undefined,
    }));
  }}
  sx={{
    '& .MuiOutlinedInput-root': selectSx,
    ...selectLabelSx,
    '& .MuiFormHelperText-root': {
      fontSize: '0.68rem',
      ml: 0.3,
      textAlign: 'right',
    },
  }}
/>

        {/* Attachment */}
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {attachment ? (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.2,
              px: 1.5, py: 1, borderRadius: '12px', bgcolor: '#F8F9FA',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <FileIcon sx={{ fontSize: '1.1rem', color: '#FA510F', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attachment.name}
              </Typography>
              <IconButton size="small" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                <CloseIcon sx={{ fontSize: '0.9rem', color: '#9CA3AF' }} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
                px: 1.5, py: 1.2, borderRadius: '12px',
                border: '1.5px dashed rgba(0,0,0,0.12)', cursor: 'pointer',
                color: '#9CA3AF', transition: 'all 0.15s',
                '&:hover': { borderColor: '#FA510F', color: '#FA510F', bgcolor: '#FFF4F0' },
              }}
            >
              <AttachFileIcon sx={{ fontSize: '1rem' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Attach a screenshot (optional)</Typography>
            </Box>
          )}
          {fieldErrors.attachment && (
            <Typography sx={{ fontSize: '0.68rem', color: '#DC2626', mt: 0.5, ml: 0.3 }}>{fieldErrors.attachment}</Typography>
          )}
        </Box>

        {formError && (
          <Box sx={{ px: 2, py: 1.2, borderRadius: '10px', bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626' }}>{formError}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 0.5 }}>
          <Button
            fullWidth variant="outlined" onClick={handleClose} disabled={isSubmitting}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              borderColor: 'rgba(0,0,0,0.12)', color: '#374151', py: 1.2,
              '&:hover': { bgcolor: '#F8F9FA', borderColor: 'rgba(0,0,0,0.2)' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth variant="contained" disabled={isSubmitting} onClick={handleSubmit}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2,
              background: !isSubmitting ? 'linear-gradient(135deg,#DC2626,#B91C1C)' : undefined,
              boxShadow: !isSubmitting ? '0 4px 14px rgba(220,38,38,0.25)' : 'none',
              '&:not(:disabled):hover': { background: 'linear-gradient(135deg,#B91C1C,#991B1B)' },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                Submitting…
              </Box>
            ) : 'Submit Report'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── FAQ data ───────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = ['All', 'Account', 'Payments', 'Security'] as const;

const FAQ_ITEMS: { category: typeof FAQ_CATEGORIES[number]; question: string; answer: string }[] = [
  {
    category: 'Account',
    question: 'How do I update my profile information?',
    answer: 'Go to Settings → Profile and tap "Edit Profile". You can update your name, phone number, date of birth, country, and currency, then tap "Save".',
  },
  {
    category: 'Account',
    question: 'How do I change my profile photo?',
    answer: 'Tap your avatar at the top of the Profile section, then drag and drop an image or click "Browse Files". Photos must be JPG, PNG, GIF, or WebP and under 5 MB.',
  },
  {
    category: 'Security',
    question: 'How do I change my password?',
    answer: 'Go to Settings → Security → Password → "Change". You\'ll need your current password plus a new one that\'s at least 8 characters, ideally mixing uppercase, lowercase, numbers, and symbols.',
  },
  {
    category: 'Security',
    question: 'What should I do if I notice suspicious activity?',
    answer: 'Change your password immediately from Settings → Security, then contact our support team through "Contact Support" so we can review your account activity.',
  },
  {
    category: 'Payments',
    question: 'Why is my transaction still pending?',
    answer: 'Most transactions settle within a few minutes, but some can take longer depending on the payment method and network conditions. If it\'s been over 24 hours, please report it via "Report a Problem".',
  },
  {
    category: 'Payments',
    question: 'Which currencies are supported?',
    answer: 'You can set your preferred display currency under Settings → Profile → Edit Profile. This affects how balances and amounts are shown across the app.',
  },
  {
    category: 'Account',
    question: 'How do I sign out of my account?',
    answer: 'Scroll to the Danger Zone at the bottom of Settings and tap "Sign Out". You\'ll need to log back in with your credentials next time.',
  },
];

// ─── FAQ row (expandable) ──────────────────────────────────────────────────
function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)', '&:last-child': { borderBottom: 'none' } }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
          px: { xs: 2, sm: 2.5 }, py: { xs: 1.6, sm: 1.8 }, cursor: 'pointer',
          '&:hover': { bgcolor: '#FAFBFC' }, transition: 'background 0.15s',
        }}
      >
        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.4 }}>
          {question}
        </Typography>
        <ExpandMoreIcon
          sx={{
            fontSize: '1.2rem', color: '#9CA3AF', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </Box>
      <Box
        sx={{
          maxHeight: open ? 300 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.25s ease',
        }}
      >
        <Typography sx={{
          fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.6,
          px: { xs: 2, sm: 2.5 }, pb: 2, pr: { xs: 4, sm: 5 },
        }}>
          {answer}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── FAQ / Help Center Dialog ───────────────────────────────────────────────
function FaqDialog({
  open, onClose, onContactSupport,
}: {
  open: boolean;
  onClose: () => void;
  onContactSupport: () => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<typeof FAQ_CATEGORIES[number]>('All');

  const filtered = FAQ_ITEMS.filter(item => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesSearch = !search.trim()
      || item.question.toLowerCase().includes(search.toLowerCase())
      || item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleClose = () => {
    onClose();
    setSearch('');
    setCategory('All');
  };

  const handleContactUs = () => {
    handleClose();
    onContactSupport();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 }, overflow: 'hidden', maxHeight: '85vh' } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
            bgcolor: '#FFF4F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaqIcon sx={{ color: '#FA510F', fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Help Center</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>Answers to common questions</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search FAQs…"
          value={search}
          fullWidth
          onChange={e => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.1rem', color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px', fontSize: '0.85rem', bgcolor: '#FAFBFC',
              '&.Mui-focused fieldset': { borderColor: '#FA510F' },
            },
          }}
        />

        {/* Category filter chips */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {FAQ_CATEGORIES.map(cat => {
            const selected = category === cat;
            return (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setCategory(cat)}
                sx={{
                  fontWeight: 700, fontSize: '0.72rem', borderRadius: '10px',
                  bgcolor: selected ? '#FFF4F0' : '#F8F9FA',
                  color: selected ? '#FA510F' : '#9CA3AF',
                  border: selected ? '1.5px solid #FA510F' : '1.5px solid transparent',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#FFF4F0', color: '#FA510F' },
                }}
              />
            );
          })}
        </Box>

        {/* Results */}
        <Box sx={{
          borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)',
          maxHeight: 340, overflowY: 'auto',
        }}>
          {filtered.length > 0 ? (
            filtered.map(item => (
              <FaqRow key={item.question} question={item.question} answer={item.answer} />
            ))
          ) : (
            <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>
                No results for &ldquo;{search}&rdquo;
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#C4C9D4', mt: 0.5 }}>
                Try a different search term or category
              </Typography>
            </Box>
          )}
        </Box>

        {/* Still need help footer */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
          px: 2, py: 1.4, borderRadius: '14px', bgcolor: '#FFF4F0',
        }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>Still need help?</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mt: 0.1 }}>We usually reply within 24 hours</Typography>
          </Box>
          <Button
            size="small"
            onClick={handleContactUs}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', fontSize: '0.75rem',
              background: 'linear-gradient(135deg,#FA510F,#D94309)', color: '#fff', px: 2,
              '&:hover': { background: 'linear-gradient(135deg,#D94309,#B33000)' },
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const isMobile = useMediaQuery('(max-width:600px)');

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { logout } = useAuth();

  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: profileResponse, isLoading: profileLoading, isError: profileError } = useGetProfile();
  const updateProfileMutation = useUpdateProfileDetails();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const changePasswordMutation = useChangePassword();
  const createTicketMutation = useCreateSupportTicket();

  const profile = profileResponse?.data;

  // ── Local state ────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Edit form state — seeded from API data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    country: '',
    currency: '',
    accountType: '',
  });

  // Track displayed photo URL (from API or local preview after upload)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Success/error banners
  const [profileSaved, setProfileSaved] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [photoError, setPhotoError] = useState('');

  // const [notifications, setNotifications] = useState({ email: true, push: true, transactions: true });
  // const [security, setSecurity] = useState({ loginAlerts: true, deviceManagement: false, activityProtection: true });

  // Sync profile photo from API when profile loads
  useEffect(() => {
    if (profile?.profilePhoto) {
      setPhotoUrl(profile.profilePhoto);
    }
  }, [profile?.profilePhoto]);

  // Seed form when entering edit mode
  const handleEditClick = () => {
    setFormData({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      country: profile?.country ?? '',
      currency: profile?.currency ?? '',
      accountType: profile?.accountType ?? '',
    });
    setSaveError('');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateProfileMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth || undefined,
        country: formData.country || undefined,
        currency: formData.currency || undefined,
        accountType: formData.accountType || undefined,
      });
      setEditing(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setSaveError('Failed to update profile. Please try again.');
    }
  };

  const handlePhotoSave = async (base64Url: string) => {
    setPhotoError('');
    try {
      const response = await uploadPhotoMutation.mutateAsync({ photoUrl: base64Url });
      // Update photoUrl with the response from server (in case it's processed/stored differently)
      if (response?.data?.profilePhoto) {
        setPhotoUrl(response.data.profilePhoto);
      } else {
        // Fallback to the uploaded base64 if server doesn't return processed version
        setPhotoUrl(base64Url);
      }
      setAvatarOpen(false);
      setPhotoSaved(true);
      setTimeout(() => setPhotoSaved(false), 3000);
    } catch {
      setPhotoError('Failed to upload photo. Please try again.');
    }
  };

  const handlePasswordChange = async ({ oldPassword, newPassword, confirmPassword }: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    // Let errors bubble up so the dialog can display them inline
    await changePasswordMutation.mutateAsync({
      oldPassword,
      newPassword,
      confirmPassword,
    });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleContactSubmit = async ({ topic, subject, message }: { topic: string; subject: string; message: string }) => {
    setContactSubmitting(true);
    try {
      await createTicketMutation.mutateAsync({ topic, subject, message });
      setContactSent(true);
      setTimeout(() => setContactSent(false), 4000);
    } catch (error) {
      // console.error('Failed to create support ticket:', error);
      // You can add error handling here if needed
      setContactSent(false);
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleReportSubmit = async ({
    // issueType, severity, description, attachment,
  }: { issueType: string; severity: string; description: string; attachment: File | null }) => {
    // TODO: wire up to backend once the report-a-problem endpoint is ready.
    // console.log('Report a problem submission (not yet sent to API):', { issueType, severity, description, attachment });
    setReportSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // simulate request
    setReportSubmitting(false);
    setReportSent(true);
    setTimeout(() => setReportSent(false), 4000);
  };

  // ── Logout handlers ────────────────────────────────────────────────────────
  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutConfirmOpen(false);
    logout();
  };

  const displayName = profile
    ? `${profile.firstName}${profile.middleName ? ' ' + profile.middleName : ''} ${profile.lastName}`.trim()
    : 'John Doe';

  const displayInitials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : 'JD';

  const PillButton = ({
    label, variant = 'default', onClick,
  }: { label: string; variant?: 'default' | 'orange' | 'green'; onClick?: () => void }) => {
    const styles = {
      default: { bgcolor: '#F1F5F9', color: '#374151', hbg: '#E8EDF5' },
      orange:  { bgcolor: '#FFF4F0', color: '#FA510F', hbg: '#FFE8DC' },
      green:   { bgcolor: '#ECFDF5', color: '#059669', hbg: '#D1FAE5' },
    }[variant];
    return (
      <Box component="button" onClick={onClick} sx={{
        px: { xs: 1.2, sm: 1.5 }, py: 0.7, borderRadius: '10px', border: 'none', cursor: 'pointer',
        bgcolor: styles.bgcolor, color: styles.color, fontSize: '0.75rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 0.4,
        transition: 'all 0.15s', '&:hover': { bgcolor: styles.hbg }, whiteSpace: 'nowrap',
      }}>
        {label}<ArrowIcon sx={{ fontSize: '0.7rem' }} />
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden', pb: 4 }}>

      {/* ── Page header ── */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 900, color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
          Settings
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
          Manage your account and preferences
        </Typography>
      </Box>

      {/* ── Profile ── */}
      <Section label="Profile">
        {/* Avatar + name hero */}
        <Box sx={{
          px: { xs: 2, sm: 2.5 }, pt: { xs: 2.5, sm: 3 }, pb: 2.5,
          display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'linear-gradient(135deg, #FFFBF9 0%, #FFF4F0 100%)',
        }}>
          {/* Clickable avatar */}
          <Box
            onClick={() => setAvatarOpen(true)}
            sx={{
              position: 'relative', flexShrink: 0, cursor: 'pointer',
              '&:hover .cam-overlay': { opacity: 1 },
            }}
          >
            <Avatar
              src={photoUrl ?? undefined}
              sx={{
                width: { xs: 60, sm: 72 }, height: { xs: 60, sm: 72 },
                background: 'linear-gradient(135deg, #FA510F, #D94309)',
                fontSize: { xs: '1.3rem', sm: '1.6rem' }, fontWeight: 800,
                boxShadow: photoUrl ? '0 8px 24px rgba(250,81,15,0.25)' : '0 8px 24px rgba(250,81,15,0.3)',
                border: photoUrl ? '2.5px solid #FA510F' : 'none',
                transition: 'box-shadow 0.2s',
              }}
            >
              {profileLoading ? null : displayInitials}
            </Avatar>

            <Box
              className="cam-overlay"
              sx={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
            >
              <CameraIcon sx={{ color: '#fff', fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
            </Box>

            <Box sx={{
              position: 'absolute', bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: '50%',
              bgcolor: '#059669', border: '2px solid #fff',
            }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {profileLoading ? (
              <>
                <Skeleton variant="text" width="50%" height={22} />
                <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} />
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 0.2 }}>
                  {profile?.email ?? ''}
                </Typography>
              </>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3, borderRadius: '6px', bgcolor: '#ECFDF5' }}>
                <CheckIcon sx={{ fontSize: '0.7rem', color: '#059669' }} />
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#059669', letterSpacing: '0.04em' }}>Verified Account</Typography>
              </Box>
              <Box
                onClick={() => setAvatarOpen(true)}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.4,
                  px: 1, py: 0.3, borderRadius: '6px',
                  bgcolor: '#FFF4F0', cursor: 'pointer',
                  '&:hover': { bgcolor: '#FFE8DC' }, transition: 'background 0.15s',
                }}
              >
                <CameraIcon sx={{ fontSize: '0.7rem', color: '#FA510F' }} />
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#FA510F', letterSpacing: '0.04em' }}>
                  {photoUrl ? 'Change Photo' : 'Add Photo'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant={editing ? 'contained' : 'outlined'}
            size="small"
            startIcon={editing
              ? (updateProfileMutation.isPending ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <CheckIcon />)
              : <EditIcon />
            }
            onClick={editing ? handleSave : handleEditClick}
            disabled={profileLoading || updateProfileMutation.isPending}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: '10px',
              flexShrink: 0, fontSize: '0.78rem',
              ...(editing ? {
                background: 'linear-gradient(135deg,#FA510F,#D94309)',
                boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                border: 'none', color: '#fff',
                '&:hover': { background: 'linear-gradient(135deg,#D94309,#B33000)' },
                '&:disabled': { opacity: 0.7 },
              } : {
                borderColor: 'rgba(0,0,0,0.15)', color: '#374151',
                '&:hover': { bgcolor: '#F8F9FA' },
              }),
            }}
          >
            {editing
              ? (updateProfileMutation.isPending ? 'Saving…' : 'Save')
              : (isMobile ? 'Edit' : 'Edit Profile')
            }
          </Button>
        </Box>

        {/* ── Banners ── */}
        {photoSaved && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#FFF4F0', borderBottom: '1px solid rgba(250,81,15,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraIcon sx={{ fontSize: '0.9rem', color: '#FA510F' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#FA510F' }}>Profile photo updated!</Typography>
          </Box>
        )}
        {photoError && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#FEF2F2', borderBottom: '1px solid rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>{photoError}</Typography>
          </Box>
        )}
        {profileSaved && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#ECFDF5', borderBottom: '1px solid rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon sx={{ fontSize: '0.9rem', color: '#059669' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>Profile updated successfully</Typography>
          </Box>
        )}
        {saveError && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#FEF2F2', borderBottom: '1px solid rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>{saveError}</Typography>
          </Box>
        )}
        {profileError && !profileLoading && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#FEF2F2', borderBottom: '1px solid rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarnIcon sx={{ fontSize: '0.9rem', color: '#DC2626' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>Could not load profile data.</Typography>
          </Box>
        )}

        {/* ── Fields ── */}
        {profileLoading ? (
          <>
            <FieldRowSkeleton />
            <FieldRowSkeleton />
            <FieldRowSkeleton />
            <FieldRowSkeleton />
            <FieldRowSkeleton />
            <FieldRowSkeleton />
          </>
        ) : editing ? (
          <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField
                size="small" label="First Name" value={formData.firstName} type="text" fullWidth
                onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.88rem', '&.Mui-focused fieldset': { borderColor: '#FA510F' } },
                  '& label.Mui-focused': { color: '#FA510F' },
                }}
              />
              <TextField
                size="small" label="Last Name" value={formData.lastName} type="text" fullWidth
                onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.88rem', '&.Mui-focused fieldset': { borderColor: '#FA510F' } },
                  '& label.Mui-focused': { color: '#FA510F' },
                }}
              />
              <TextField
                size="small" label="Phone Number" value={formData.phoneNumber} type="tel" fullWidth
                onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.88rem', '&.Mui-focused fieldset': { borderColor: '#FA510F' } },
                  '& label.Mui-focused': { color: '#FA510F' },
                }}
              />
              <TextField
                size="small" label="Date of Birth" value={formData.dateOfBirth} type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={e => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.88rem', '&.Mui-focused fieldset': { borderColor: '#FA510F' } },
                  '& label.Mui-focused': { color: '#FA510F' },
                }}
              />
              <TextField
                size="small" label="Country" value={formData.country} type="text" fullWidth
                onChange={e => setFormData(f => ({ ...f, country: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.88rem', '&.Mui-focused fieldset': { borderColor: '#FA510F' } },
                  '& label.Mui-focused': { color: '#FA510F' },
                }}
              />
              <TextField
                size="small" label="Currency" value={formData.currency} type="text" fullWidth
                onChange={e => setFormData(f => ({ ...f, currency: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.88rem', '&.Mui-focused fieldset': { borderColor: '#FA510F' } },
                  '& label.Mui-focused': { color: '#FA510F' },
                }}
              />
            </Box>
          </Box>
        ) : (
          <>
            <FieldRow icon={<PersonIcon />} label="Full Name"     value={displayName} />
            <FieldRow icon={<EmailIcon />}  label="Email Address" value={profile?.email ?? ''} />
            <FieldRow icon={<DeviceIcon />} label="Phone Number"  value={profile?.phoneNumber ?? ''} />
            <FieldRow icon={<CakeIcon />}   label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} />
            <FieldRow icon={<PersonIcon />} label="Country"       value={profile?.country ?? ''} />
            <FieldRow icon={<PersonIcon />} label="Currency"      value={profile?.currency ?? ''} />
          </>
        )}

        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, bgcolor: '#FAFBFC', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#C4C9D4', fontWeight: 600 }}>
            Member since:{' '}
            <span style={{ color: '#9CA3AF' }}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </span>
          </Typography>
        </Box>
      </Section>

      {/* ── Security ── */}
      <Section label="Security">
        {passwordSaved && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#ECFDF5', borderBottom: '1px solid rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon sx={{ fontSize: '0.9rem', color: '#059669' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>Password changed successfully</Typography>
          </Box>
        )}
        <ActionRow
          icon={<LockIcon />}
          title="Password"
          subtitle=""
          action={<PillButton label="Change" onClick={() => setPasswordDialogOpen(true)} />}
        />
        {/* <ActionRow icon={<ShieldIcon />} title="Two-Factor Authentication"   subtitle="Add an extra layer of security"   action={<PillButton label="Enable" variant="orange" />} /> */}
        {/* <ActionRow icon={<DeviceIcon />} title="Active Sessions"             subtitle="Manage your active logins"        action={<PillButton label="View" />} /> */}
      </Section>

      {/* ── Notifications ── */}
      {/* <Section label="Notifications">
        <ToggleRow icon={<EmailIcon />}  title="Email Notifications" subtitle="Receive updates and statements via email"   checked={notifications.email}        onChange={v => setNotifications(n => ({ ...n, email: v }))} />
        <ToggleRow icon={<BellIcon />}   title="Push Notifications"  subtitle="Real-time alerts on your device"            checked={notifications.push}         onChange={v => setNotifications(n => ({ ...n, push: v }))} />
        <ToggleRow icon={<DeviceIcon />} title="Transaction Alerts"  subtitle="Instant notification for every transaction" checked={notifications.transactions}  onChange={v => setNotifications(n => ({ ...n, transactions: v }))} />
      </Section> */}

      {/* ── Privacy ── */}
      {/* <Section label="Privacy">
        <ToggleRow icon={<ShieldIcon />} title="Login Alerts"                   subtitle="Alert me when someone logs into my account"  checked={security.loginAlerts}        onChange={v => setSecurity(s => ({ ...s, loginAlerts: v }))} />
        <ToggleRow icon={<LockIcon />}   title="Suspicious Activity Protection" subtitle="Automatically block unauthorized access"      checked={security.activityProtection} onChange={v => setSecurity(s => ({ ...s, activityProtection: v }))} />
      </Section> */}

      {/* ── Support ── */}
      <Section label="Support">
        {contactSent && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#ECFDF5', borderBottom: '1px solid rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon sx={{ fontSize: '0.9rem', color: '#059669' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>Message sent! Our team will get back to you shortly.</Typography>
          </Box>
        )}
        {reportSent && (
          <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#ECFDF5', borderBottom: '1px solid rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon sx={{ fontSize: '0.9rem', color: '#059669' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>Thanks for the report — we're on it.</Typography>
          </Box>
        )}
        {[
          { icon: <HelpIcon />,  title: 'Help Center',      subtitle: 'Browse FAQs and guides', onClick: () => setFaqDialogOpen(true) },
          { icon: <EmailIcon />, title: 'Contact Support',  subtitle: 'Get help from our team', onClick: () => setContactDialogOpen(true) },
          // { icon: <WarnIcon />,  title: 'Report a Problem', subtitle: 'Let us know about an issue', onClick: () => setReportDialogOpen(true) },
        ].map(item => (
          <Box key={item.title} onClick={item.onClick} sx={{ cursor: 'pointer' }}>
            <ActionRow
              icon={item.icon} title={item.title} subtitle={item.subtitle}
              action={
                <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: '#EDEFF5' }, transition: 'background 0.15s' }}>
                  <ArrowIcon sx={{ fontSize: '0.75rem', color: '#9CA3AF' }} />
                </Box>
              }
            />
          </Box>
        ))}
      </Section>

      {/* ── Danger Zone ── */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#DC2626', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1.2 }}>
          Danger Zone
        </Typography>
        <Box sx={{ borderRadius: '20px', bgcolor: '#fff', border: '1.5px solid rgba(220,38,38,0.2)', boxShadow: '0 2px 16px rgba(220,38,38,0.06)', overflow: 'hidden' }}>
          <ActionRow
            icon={<LogoutIcon />} title="Sign Out " subtitle="" danger
            action={
              <Box
                component="button"
                onClick={handleLogoutClick}
                sx={{ px: 1.5, py: 0.7, borderRadius: '10px', border: 'none', cursor: 'pointer', bgcolor: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.4, transition: 'all 0.15s', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#FDE68A' } }}
              >
                Sign Out <ArrowIcon sx={{ fontSize: '0.7rem' }} />
              </Box>
            }
          />
          {/* <ActionRow
            icon={<DeleteIcon />} title="Delete Account" subtitle="Permanently remove your account and all data" danger
            action={
              <Box component="button" sx={{ px: 1.5, py: 0.7, borderRadius: '10px', border: 'none', cursor: 'pointer', bgcolor: '#FEF2F2', color: '#DC2626', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.4, transition: 'all 0.15s', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#FEE2E2' } }}>
                Delete <ArrowIcon sx={{ fontSize: '0.7rem' }} />
              </Box>
            }
          /> */}
        </Box>
      </Box>

      {/* ── Upload dialog ── */}
      <AvatarUploadDialog
        open={avatarOpen}
        onClose={() => { setAvatarOpen(false); setPhotoError(''); }}
        onSave={handlePhotoSave}
        currentImage={photoUrl}
        isUploading={uploadPhotoMutation.isPending}
      />

      {/* ── Change password dialog ── */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSubmit={handlePasswordChange}
        isSubmitting={changePasswordMutation.isPending}
      />

      {/* ── Contact support dialog ── */}
      <ContactSupportDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        onSubmit={handleContactSubmit}
        isSubmitting={contactSubmitting}
        defaultEmail={profile?.email}
      />

      {/* ── Report a problem dialog ── */}
      <ReportProblemDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={reportSubmitting}
      />

      {/* ── FAQ / Help Center dialog ── */}
      <FaqDialog
        open={faqDialogOpen}
        onClose={() => setFaqDialogOpen(false)}
        onContactSupport={() => setContactDialogOpen(true)}
      />

      {/* ── Logout confirmation dialog ── */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={handleLogoutCancel}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', m: { xs: 1.5, sm: 3 } } } }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%',
            bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', mx: 'auto', mb: 2,
          }}>
            <LogoutIcon sx={{ color: '#DC2626', fontSize: '1.6rem' }} />
          </Box>

          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', mb: 0.8 }}>
            Log out of your account?
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mb: 3 }}>
            You'll need to sign in again to access your dashboard.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Button
              fullWidth variant="outlined" onClick={handleLogoutCancel}
              sx={{
                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                borderColor: 'rgba(0,0,0,0.12)', color: '#374151', py: 1.2,
                '&:hover': { bgcolor: '#F8F9FA', borderColor: 'rgba(0,0,0,0.2)' },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth variant="contained" onClick={handleLogoutConfirm}
              sx={{
                borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.2,
                background: 'linear-gradient(135deg,#DC2626,#B91C1C)',
                boxShadow: '0 4px 14px rgba(220,38,38,0.25)',
                '&:hover': { background: 'linear-gradient(135deg,#B91C1C,#991B1B)' },
              }}
            >
              Log Out
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}