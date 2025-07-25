import React, { useState, useEffect } from 'react';
import { Button, Frame } from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import styled from 'styled-components';

const RPGContainer = styled.div`
  background: linear-gradient(45deg, #4a9c59 25%, #5fb370 25%, #5fb370 50%, #4a9c59 50%, #4a9c59 75%, #5fb370 75%);
  background-size: 16px 16px;
  min-height: 400px;
  padding: 20px;
  font-family: 'Courier New', monospace;
  position: relative;
`;

const DialogueBox = styled(Frame)`
  background: #000;
  color: #fff;
  padding: 16px;
  margin: 20px auto;
  max-width: 600px;
  border: 4px solid #fff;
  border-radius: 0;
  box-shadow: 4px 4px 0px #333;
  font-size: 18px;
  line-height: 1.4;
  position: relative;
  
  &::after {
    content: '▼';
    position: absolute;
    bottom: 8px;
    right: 16px;
    animation: bounce 1s infinite;
    color: #ccc;
  }
`;

const NameBox = styled(Frame)`
  background: #000;
  color: #fff;
  padding: 12px;
  border: 3px solid #fff;
  text-align: left;
  font-size: 18px;
  min-height: 40px;
  margin: 10px auto;
  max-width: 400px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  
  .cursor {
    animation: blink 1s infinite;
    color: #fff;
  }
`;

const KeyboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  max-width: 540px;
  margin: 20px auto;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 3px solid #666;
`;

const KeyButton = styled.button`
  background: #333;
  color: #fff;
  border: 2px solid #666;
  padding: 12px 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.1s;
  
  &:hover {
    background: #555;
    border-color: #999;
    transform: translateY(-1px);
  }
  
  &:active {
    background: #222;
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SpecialButton = styled(KeyButton)`
  grid-column: span 2;
  background: #444;
  
  &:hover {
    background: #666;
  }
`;

const CharacterSprite = styled.div`
  position: absolute;
  top: 30px;
  left: 50px;
  width: 48px;
  height: 48px;
  background: url('/images/icons/user.png') no-repeat center;
  background-size: contain;
  image-rendering: pixelated;
  animation: idle 2s ease-in-out infinite alternate;
  
  @keyframes idle {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-2px); }
  }
`;

interface RPGProfileFormProps {
  onComplete: () => void;
  onCancel?: () => void;
}

type FormStep = 'username' | 'discord' | 'email' | 'confirm';

const RPGProfileForm: React.FC<RPGProfileFormProps> = ({ onComplete, onCancel }) => {
  const { primaryWallet } = useDynamicContext();
  const { createProfile, updateProfile, checkUsername, profile } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('username');
  const [formData, setFormData] = useState({
    username: '',
    discord_id: '',
    email: ''
  });
  const [currentInput, setCurrentInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!profile;

  // Initialize with existing profile data if editing
  useEffect(() => {
    if (isEditMode && profile) {
      setFormData({
        username: profile.username || '',
        discord_id: profile.discord_id || '',
        email: profile.email || ''
      });
    }
  }, [isEditMode, profile]);

  const keyboards = {
    upper: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
      'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
      'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '⌫', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ],
    lower: [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
      'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
      's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '⌫', '_', '-', '.', '@', '!', '?', '#', '$', '%', '&'
    ],
    special: [
      '0', '1', '2', '3', '4', '5', '6', '7', '8',
      '9', '.', '@', '#', '$', '%', '&', '*', '(',
      ')', '+', '=', '[', ']', '{', '}', '|', '⌫', '!', '?', '~', '^', '<', '>', '/', '\\', ':'
    ]
  };

  const [keyboardMode, setKeyboardMode] = useState<'upper' | 'lower' | 'special'>('upper');

  const stepConfig = {
    username: {
      title: 'Username',
      prompt: 'What would you like to be called in the Flunks world?',
      placeholder: 'FlunkMaster2024',
      maxLength: 32,
      required: true
    },
    discord: {
      title: 'Discord ID',
      prompt: 'Want to link your Discord? (You can skip this step)',
      placeholder: '123456789012345678',
      maxLength: 64,
      required: false
    },
    email: {
      title: 'Email',
      prompt: 'How about an email for updates? (This is optional too!)',
      placeholder: 'flunk@example.com',
      maxLength: 255,
      required: false
    },
    confirm: {
      title: 'Profile Complete',
      prompt: 'Everything looks good! Ready to join the community?',
      placeholder: '',
      maxLength: 0,
      required: false
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setCurrentInput(prev => prev.slice(0, -1));
      return;
    }

    const maxLen = stepConfig[currentStep].maxLength;
    if (currentInput.length < maxLen) {
      setCurrentInput(prev => prev + key);
    }
  };

  const validateCurrentInput = async () => {
    if (currentStep === 'username') {
      if (currentInput.length < 3) {
        setValidationMessage('Username must be at least 3 characters');
        return false;
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(currentInput)) {
        setValidationMessage('Only letters, numbers, hyphens, and underscores allowed');
        return false;
      }

      // Skip username check if it's the same as current username in edit mode
      if (isEditMode && profile?.username === currentInput) {
        setValidationMessage('Current username');
        return true;
      }

      setIsValidating(true);
      const result = await checkUsername(currentInput);
      setIsValidating(false);
      
      if (!result.available) {
        setValidationMessage(result.reason);
        return false;
      }
    }

    if (currentStep === 'email' && currentInput) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentInput)) {
        setValidationMessage('Please enter a valid email address');
        return false;
      }
    }

    setValidationMessage('');
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 'confirm') {
      await handleSubmit();
      return;
    }

    if (stepConfig[currentStep].required && !currentInput.trim()) {
      setValidationMessage('This field is required');
      return;
    }

    if (currentInput.trim() && !(await validateCurrentInput())) {
      return;
    }

    // Save current input to form data
    setFormData(prev => ({
      ...prev,
      [currentStep === 'discord' ? 'discord_id' : currentStep]: currentInput.trim()
    }));

    // Move to next step
    const steps: FormStep[] = ['username', 'discord', 'email', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setCurrentInput('');
      setValidationMessage('');
    }
  };

  const handleSkip = () => {
    if (currentStep === 'username') return; // Username is required
    
    setFormData(prev => ({
      ...prev,
      [currentStep === 'discord' ? 'discord_id' : currentStep]: ''
    }));

    const steps: FormStep[] = ['username', 'discord', 'email', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      setCurrentInput('');
      setValidationMessage('');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const success = isEditMode 
        ? await updateProfile(formData)
        : await createProfile(formData);

      if (success) {
        onComplete();
      }
    } catch (error) {
      setValidationMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConfirmationScreen = () => (
    <div>
      <NameBox>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          Profile Summary
        </div>
        <div style={{ fontSize: '16px', textAlign: 'left', lineHeight: '1.6' }}>
          <div>👤 Username: <strong>{formData.username}</strong></div>
          {formData.discord_id && (
            <div>🎮 Discord: <strong>{formData.discord_id}</strong></div>
          )}
          {formData.email && (
            <div>📧 Email: <strong>{formData.email}</strong></div>
          )}
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#aaa' }}>
            💰 Wallet: {primaryWallet?.address?.slice(0, 8)}...
          </div>
        </div>
      </NameBox>
    </div>
  );

  const config = stepConfig[currentStep];

  return (
    <RPGContainer>
      <CharacterSprite />
      
      <DialogueBox variant="window">
        <div style={{ marginBottom: '10px' }}>
          <strong>Ness:</strong> {config.prompt}
        </div>
      </DialogueBox>

      {currentStep === 'confirm' ? (
        renderConfirmationScreen()
      ) : (
        <>
          <NameBox>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7, fontSize: '14px' }}>
                {config.title.toUpperCase()}:
              </span>
              <span style={{ fontSize: '12px', opacity: 0.5 }}>
                {currentInput.length}/{config.maxLength}
              </span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '20px', minHeight: '24px' }}>
              {currentInput || (
                <span style={{ opacity: 0.4, fontStyle: 'italic' }}>
                  {config.placeholder}
                </span>
              )}
              {currentInput && <span className="cursor">_</span>}
            </div>
          </NameBox>

          <KeyboardGrid>
            {keyboards[keyboardMode].map((key, index) => (
              <KeyButton
                key={`${key}-${index}`}
                onClick={() => handleKeyPress(key)}
                disabled={isValidating || isSubmitting}
                style={{
                  backgroundColor: key === '⌫' ? '#666' : '#333',
                  gridColumn: key === '⌫' ? 'span 1' : 'span 1'
                }}
              >
                {key}
              </KeyButton>
            ))}
          </KeyboardGrid>

          <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
            <Button
              onClick={() => setKeyboardMode(
                keyboardMode === 'upper' ? 'lower' : 
                keyboardMode === 'lower' ? 'special' : 'upper'
              )}
              disabled={isValidating || isSubmitting}
              style={{ 
                marginRight: '10px',
                background: '#444',
                border: '2px solid #666'
              }}
            >
              {keyboardMode === 'upper' ? 'lowercase' : 
               keyboardMode === 'lower' ? 'symbols' : 'UPPERCASE'}
            </Button>

            <Button
              onClick={() => setCurrentInput('')}
              disabled={isValidating || isSubmitting || !currentInput}
              style={{ 
                background: '#664444',
                border: '2px solid #996666'
              }}
            >
              Clear All
            </Button>
          </div>
        </>
      )}

      {validationMessage && (
        <DialogueBox variant="window" style={{ background: '#220000', borderColor: '#ff6666' }}>
          {validationMessage}
        </DialogueBox>
      )}

      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px',
        padding: '20px',
        background: 'rgba(0,0,0,0.7)',
        border: '2px solid #666',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {!stepConfig[currentStep].required && currentStep !== 'confirm' && (
            <Button
              onClick={handleSkip}
              disabled={isValidating || isSubmitting}
              style={{ 
                background: '#444',
                border: '2px solid #666',
                color: '#ccc',
                minWidth: '100px'
              }}
            >
              Don't Care
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isValidating || isSubmitting || (stepConfig[currentStep].required && !currentInput.trim())}
            style={{ 
              background: isValidating || isSubmitting ? '#333' : '#006600',
              border: '2px solid #00aa00',
              color: '#fff',
              minWidth: '120px',
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? '💾 Saving...' : 
             isValidating ? '🔍 Checking...' : 
             currentStep === 'confirm' ? (isEditMode ? '✅ Update' : '✨ Create') : 
             'OK ▶'}
          </Button>

          {onCancel && (
            <Button 
              onClick={onCancel} 
              disabled={isSubmitting}
              style={{ 
                background: '#660000',
                border: '2px solid #aa0000',
                color: '#fff',
                minWidth: '100px'
              }}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Step indicator */}
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#999',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {['username', 'discord', 'email', 'confirm'].map((step, index) => (
            <span
              key={step}
              style={{
                padding: '4px 8px',
                background: currentStep === step ? '#006600' : '#333',
                border: '1px solid #666',
                borderRadius: '4px',
                fontSize: '10px'
              }}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        .cursor {
          animation: blink 1s infinite;
        }
      `}</style>
    </RPGContainer>
  );
};

export default RPGProfileForm;
