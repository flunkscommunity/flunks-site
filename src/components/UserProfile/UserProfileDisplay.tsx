import React from 'react';
import { 
  Button, 
  Frame, 
  GroupBox,
  Separator,
  Window,
  WindowHeader,
  WindowContent
} from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface UserProfileDisplayProps {
  walletAddress?: string; // If provided, shows another user's profile
  onEdit?: () => void;
  onClose?: () => void;
  compact?: boolean;
}

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({ 
  walletAddress,
  onEdit,
  onClose,
  compact = false
}) => {
  const { primaryWallet } = useDynamicContext();
  const { profile, loading, error } = useUserProfile();
  
  const isOwnProfile = !walletAddress || walletAddress === primaryWallet?.address;
  const displayProfile = profile; // In the future, we'd fetch other users' profiles here

  if (loading) {
    return (
      <Frame variant="field" className="p-4 text-center">
        <div>⏳ Loading profile...</div>
      </Frame>
    );
  }

  if (error) {
    return (
      <Frame variant="field" className="p-4 text-center bg-red-50">
        <div className="text-red-600">❌ Error: {error}</div>
      </Frame>
    );
  }

  if (!displayProfile) {
    return (
      <Frame variant="field" className="p-4 text-center">
        <div className="space-y-2">
          <div>👤 No profile found</div>
          {isOwnProfile && onEdit && (
            <Button onClick={onEdit} size="sm">
              Create Profile
            </Button>
          )}
        </div>
      </Frame>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ProfileContent = () => (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {/* Username */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">👤</span>
        <div>
          <div className="font-bold text-lg">{displayProfile.username}</div>
          {!compact && (
            <div className="text-xs text-gray-600">
              Member since {formatDate(displayProfile.created_at)}
            </div>
          )}
        </div>
      </div>

      {!compact && <Separator />}

      {/* Contact Information */}
      {!compact && (
        <div className="space-y-3">
          {displayProfile.discord_id && (
            <div className="flex items-center gap-2">
              <span className="text-lg">🎮</span>
              <div>
                <div className="font-semibold">Discord</div>
                <div className="text-sm font-mono">{displayProfile.discord_id}</div>
              </div>
            </div>
          )}

          {displayProfile.email && isOwnProfile && (
            <div className="flex items-center gap-2">
              <span className="text-lg">📧</span>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-sm">{displayProfile.email}</div>
              </div>
            </div>
          )}

          {/* Wallet Address */}
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <div className="font-semibold">Wallet</div>
              <div className="text-xs font-mono break-all">
                {displayProfile.wallet_address}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact view contact info */}
      {compact && (
        <div className="flex flex-wrap gap-2 text-sm">
          {displayProfile.discord_id && (
            <span className="bg-blue-100 px-2 py-1 rounded">
              🎮 Discord
            </span>
          )}
          {displayProfile.email && isOwnProfile && (
            <span className="bg-green-100 px-2 py-1 rounded">
              📧 Email
            </span>
          )}
        </div>
      )}

      {/* Edit Button */}
      {!compact && isOwnProfile && onEdit && (
        <>
          <Separator />
          <Button onClick={onEdit} className="w-full">
            ✏️ Edit Profile
          </Button>
        </>
      )}
    </div>
  );

  if (compact) {
    return (
      <Frame variant="field" className="p-3">
        <ProfileContent />
      </Frame>
    );
  }

  return (
    <Window className="w-full max-w-md mx-auto">
      <WindowHeader>
        <span>👤 Profile: {displayProfile.username}</span>
        {onClose && (
          <Button onClick={onClose} size="sm" className="ml-auto">
            ✕
          </Button>
        )}
      </WindowHeader>
      <WindowContent>
        <div className="p-4">
          <ProfileContent />
        </div>
      </WindowContent>
    </Window>
  );
};

export default UserProfileDisplay;
