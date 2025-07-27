import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Frame, 
  GroupBox,
  Separator,
  Window,
  WindowHeader,
  WindowContent
} from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import RPGProfileForm from './RPGProfileForm';

interface UserProfileFormProps {
  onClose?: () => void;
  isEditMode?: boolean;
  useRPGStyle?: boolean;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  onClose, 
  isEditMode = false,
  useRPGStyle = true
}) => {
  const { primaryWallet } = useDynamicContext();
  const { 
    profile, 
    loading, 
    error, 
    createProfile, 
    updateProfile, 
    checkUsername 
  } = useUserProfile();

  // If using RPG style, render the new component
  if (useRPGStyle) {
    return (
      <RPGProfileForm
        onComplete={() => {
          // Add a small delay to let users see the success screen
          setTimeout(() => {
            onClose?.();
          }, 3000); // 3 second delay to enjoy the rainbow success screen
        }}
        onCancel={onClose}
      />
    );
  }

  // Keep the original form as fallback
  const [formData, setFormData] = useState({
    username: '',
    discord_id: '',
    email: ''
  });

  const [validation, setValidation] = useState({
    username: { valid: true, message: '' },
    email: { valid: true, message: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form with existing profile data in edit mode
  useEffect(() => {
    if (isEditMode && profile) {
      setFormData({
        username: profile.username || '',
        discord_id: profile.discord_id || '',
        email: profile.email || ''
      });
    }
  }, [isEditMode, profile]);

  // Real-time username validation
  useEffect(() => {
    const validateUsername = async () => {
      if (!formData.username) {
        setValidation(prev => ({
          ...prev,
          username: { valid: true, message: '' }
        }));
        return;
      }

      if (isEditMode && profile?.username === formData.username) {
        setValidation(prev => ({
          ...prev,
          username: { valid: true, message: 'Current username' }
        }));
        return;
      }

      const result = await checkUsername(formData.username);
      setValidation(prev => ({
        ...prev,
        username: { 
          valid: result.available, 
          message: result.reason 
        }
      }));
    };

    const debounce = setTimeout(validateUsername, 300);
    return () => clearTimeout(debounce);
  }, [formData.username, checkUsername, isEditMode, profile]);

  // Email validation
  useEffect(() => {
    if (!formData.email) {
      setValidation(prev => ({
        ...prev,
        email: { valid: true, message: '' }
      }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(formData.email);
    
    setValidation(prev => ({
      ...prev,
      email: { 
        valid: isValid, 
        message: isValid ? 'Valid email' : 'Invalid email format' 
      }
    }));
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username) {
      setValidation(prev => ({
        ...prev,
        username: { valid: false, message: 'Username is required' }
      }));
      return;
    }

    if (!validation.username.valid || !validation.email.valid) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const success = isEditMode 
        ? await updateProfile(formData)
        : await createProfile(formData);

      if (success) {
        setSuccessMessage(
          isEditMode 
            ? 'Profile updated successfully! 🎉' 
            : 'Profile created successfully! Welcome to Flunks! 🎉'
        );
        
        // Close form after a delay
        setTimeout(() => {
          onClose?.();
        }, 2000);
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Window className="w-full max-w-md mx-auto">
      <WindowHeader>
        <span>
          👤 {isEditMode ? 'Edit Profile' : 'Create Profile'}
        </span>
      </WindowHeader>
      <WindowContent>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Wallet Address Display */}
          <GroupBox label="Connected Wallet">
            <div className="p-2 font-mono text-sm break-all bg-gray-100">
              {primaryWallet?.address || 'Not connected'}
            </div>
          </GroupBox>

          {/* Username Field */}
          <GroupBox label="Username *">
            <div className="space-y-2">
              <TextField
                value={formData.username}
                onChange={handleInputChange('username')}
                placeholder="Enter username (3-32 characters)"
                maxLength={32}
                disabled={isSubmitting || loading}
                style={{
                  borderColor: validation.username.valid ? undefined : '#ff0000'
                }}
              />
              {validation.username.message && (
                <div 
                  className={`text-xs ${
                    validation.username.valid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validation.username.message}
                </div>
              )}
              <div className="text-xs text-gray-600">
                Letters, numbers, hyphens, and underscores only
              </div>
            </div>
          </GroupBox>

          {/* Discord ID Field */}
          <GroupBox label="Discord ID (Optional)">
            <div className="space-y-2">
              <TextField
                value={formData.discord_id}
                onChange={handleInputChange('discord_id')}
                placeholder="Your Discord User ID"
                disabled={isSubmitting || loading}
              />
              <div className="text-xs text-gray-600">
                Find this in Discord: User Settings → Advanced → Developer Mode → Copy ID
              </div>
            </div>
          </GroupBox>

          {/* Email Field */}
          <GroupBox label="Email (Optional)">
            <div className="space-y-2">
              <TextField
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="your.email@example.com"
                disabled={isSubmitting || loading}
                style={{
                  borderColor: validation.email.valid ? undefined : '#ff0000'
                }}
              />
              {validation.email.message && (
                <div 
                  className={`text-xs ${
                    validation.email.valid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validation.email.message}
                </div>
              )}
            </div>
          </GroupBox>

          {/* Error Display */}
          {error && (
            <Frame variant="field" className="p-2 bg-red-50 border-red-300">
              <div className="text-red-600 text-sm">
                ❌ {error}
              </div>
            </Frame>
          )}

          {/* Success Message */}
          {successMessage && (
            <Frame variant="field" className="p-2 bg-green-50 border-green-300">
              <div className="text-green-600 text-sm">
                {successMessage}
              </div>
            </Frame>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {onClose && (
              <Button 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting || 
                loading || 
                !formData.username || 
                !validation.username.valid || 
                !validation.email.valid
              }
            >
              {isSubmitting 
                ? '💾 Saving...' 
                : isEditMode 
                  ? '💾 Update Profile' 
                  : '✨ Create Profile'
              }
            </Button>
          </div>

          {/* Required Fields Note */}
          <div className="text-xs text-gray-600 text-center">
            * Required fields
          </div>
        </form>
      </WindowContent>
    </Window>
  );
};

export default UserProfileForm;
