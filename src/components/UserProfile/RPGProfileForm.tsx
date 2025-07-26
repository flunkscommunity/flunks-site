import React, { useState, useEffect } from 'react';
import { Button, Frame } from 'react95';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useTrialMode } from 'contexts/TrialModeContext';
import styled from 'styled-components';

// Background pattern definitions
const backgroundPatterns = {
  gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
  diagonal: `linear-gradient(45deg, #8b5cf6 25%, #a855f7 25%, #a855f7 50%, #8b5cf6 50%, #8b5cf6 75%, #a855f7 75%)`,
  dots: `radial-gradient(circle at 25% 25%, #a855f7 2px, transparent 2px), radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px), linear-gradient(135deg, #a855f7, #8b5cf6)`,
  checkerboard: `linear-gradient(45deg, #8b5cf6 25%, transparent 25%), linear-gradient(-45deg, #8b5cf6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #a855f7 75%), linear-gradient(-45deg, transparent 75%, #a855f7 75%)`,
  hexagon: `linear-gradient(30deg, #8b5cf6 12%, transparent 12.5%, transparent 87%, #8b5cf6 87.5%, #8b5cf6), linear-gradient(150deg, #8b5cf6 12%, transparent 12.5%, transparent 87%, #8b5cf6 87.5%, #8b5cf6), linear-gradient(30deg, #8b5cf6 12%, transparent 12.5%, transparent 87%, #8b5cf6 87.5%, #8b5cf6), linear-gradient(150deg, #8b5cf6 12%, transparent 12.5%, transparent 87%, #8b5cf6 87.5%, #8b5cf6), #a855f7`,
  crosshatch: `linear-gradient(90deg, #8b5cf6 50%, transparent 50%), linear-gradient(#a855f7 50%, transparent 50%)`,
  circuit: `linear-gradient(90deg, #8b5cf6 2px, transparent 2px), linear-gradient(#a855f7 2px, transparent 2px)`
};

const backgroundSizes = {
  gradient: 'auto',
  diagonal: '16px 16px',
  dots: '20px 20px, 20px 20px, 100% 100%',
  checkerboard: '12px 12px',
  hexagon: '24px 42px',
  crosshatch: '8px 8px',
  circuit: '20px 20px'
};

const backgroundPositions = {
  gradient: 'auto',
  diagonal: 'auto',
  dots: 'auto',
  checkerboard: '0 0, 0 6px, 6px -6px, -6px 0px',
  hexagon: '0 0, 0 0, 12px 21px, 12px 21px',
  crosshatch: 'auto',
  circuit: 'auto'
};

const RPGContainer = styled.div<{ $backgroundPattern: string }>`
  background: ${props => backgroundPatterns[props.$backgroundPattern as keyof typeof backgroundPatterns]};
  background-size: ${props => backgroundSizes[props.$backgroundPattern as keyof typeof backgroundSizes]};
  background-position: ${props => backgroundPositions[props.$backgroundPattern as keyof typeof backgroundPositions]};
  background-color: ${props => props.$backgroundPattern === 'circuit' ? '#c084fc' : 'transparent'};
  min-height: 400px;
  padding: 20px;
  font-family: 'Courier New', monospace;
  position: relative;
  transition: background 0.3s ease;
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
  padding: 8px;
  border: 3px solid #fff;
  text-align: left;
  font-size: 18px;
  min-height: 40px;
  margin: 0 auto;
  max-width: 400px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  
  .cursor {
    animation: blink 1s infinite;
    color: #fff;
  }
`;

const NameInput = styled.input`
  background: transparent;
  color: #fff;
  border: none;
  outline: none;
  font-size: 20px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  width: 100%;
  caret-color: #fff;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const UsernameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
  padding: 4px;
  margin-top: 8px;
  width: 100%;
`;

const WalletDisplay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #666;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  color: #ccc;
  font-family: 'Courier New', monospace;
  z-index: 1000;
`;

const ConnectWalletPrompt = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid #a855f7;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  color: #fff;
  font-family: 'Courier New', monospace;
  max-width: 400px;
  z-index: 1001;
`;

const AstroLogo = styled.img`
  width: 64px;
  height: 80px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
  animation: float 3s ease-in-out infinite;
  object-fit: contain;
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
`;

const KeyboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
  max-width: 480px;
  margin: 0 auto;
  padding: 8px;
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

type FormStep = 'username' | 'discord' | 'email' | 'confirm' | 'success';

const RPGProfileForm: React.FC<RPGProfileFormProps> = ({ onComplete, onCancel }) => {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { isTrialMode, mockWallet } = useTrialMode();
  const { createProfile, updateProfile, checkUsername, profile } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('username');
  const [backgroundPattern, setBackgroundPattern] = useState<keyof typeof backgroundPatterns>('checkerboard');
  const [formData, setFormData] = useState({
    username: '',
    discord_id: '',
    email: ''
  });
  const [currentInput, setCurrentInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the active wallet (trial or real)
  const activeWallet = isTrialMode ? mockWallet : primaryWallet;
  const hasWallet = !!activeWallet;

  const isEditMode = !!profile;

  // Initialize with existing profile data if editing
  useEffect(() => {
    if (isEditMode && profile) {
      setFormData({
        username: profile.username || '',
        discord_id: profile.discord_id || '',
        email: profile.email || ''
      });
      // Set current input to existing username when editing
      if (currentStep === 'username' && profile.username) {
        setCurrentInput(profile.username);
      }
    }
  }, [isEditMode, profile, currentStep]);

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
      prompt: 'What do you want to be called in the Flunks universe?',
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
      title: 'Confirm',
      prompt: 'Ready to join the community? Review your details below:',
      placeholder: '',
      maxLength: 0,
      required: true
    },
    success: {
      title: 'Success!',
      prompt: '🎉 Welcome to the Flunks Universe! Your profile has been created successfully!',
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
      // Show confirmation screen for 2 seconds
      setTimeout(async () => {
        // Process the profile submission
        const success = isEditMode 
          ? await updateProfile(formData)
          : await createProfile(formData);

        if (success) {
          // Move to success screen
          setCurrentStep('success');
          setIsSubmitting(false);
        } else {
          // Handle submission failure
          setValidationMessage('Failed to save profile. Please try again.');
          setIsSubmitting(false);
        }
      }, 2000);
      
    } catch (error) {
      setValidationMessage('Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderConfirmationScreen = () => (
    <UsernameContainer>
      <AstroLogo src="/images/icons/astro-mascot.png" alt="Flunks Astronaut" />
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
    </UsernameContainer>
  );

  const renderSuccessScreen = () => {
    return (
    <UsernameContainer>
      <AstroLogo src="/images/icons/astro-mascot.png" alt="Flunks Astronaut" />
      <div style={{
        background: 'linear-gradient(45deg, #ff0080, #00ff80, #8000ff, #ff8000)',
        backgroundSize: '400% 400%',
        animation: 'rainbow 3s ease infinite',
        border: '4px solid #fff',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
        maxWidth: '500px'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          🎉 SUCCESS! 🎉
        </div>
        <div style={{ 
          fontSize: '24px', 
          marginBottom: '15px',
          color: '#fff',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          WELCOME TO THE FLUNKS UNIVERSE!
        </div>
        <div style={{ 
          fontSize: '18px', 
          marginBottom: '25px',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          lineHeight: '1.4'
        }}>
          Your profile has been created successfully!<br/>
          You're now part of the community! 🚀
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          border: '2px solid #000',
          borderRadius: '8px',
          padding: '15px',
          color: '#000',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          ✨ Profile Details ✨<br/>
          👤 {formData.username}<br/>
          {formData.discord_id && <>🎮 {formData.discord_id}<br/></>}
          {formData.email && <>📧 {formData.email}<br/></>}
          💰 {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#fff',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          animation: 'blink 1s infinite',
          marginBottom: '20px'
        }}>
          GET READY TO EXPLORE! 🌟
        </div>
        <Button
          onClick={onComplete}
          style={{
            background: '#00aa00',
            border: '3px solid #00ff00',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          🚀 Continue to Flunks Universe!
        </Button>
      </div>
    </UsernameContainer>
  );
  };

  const config = stepConfig[currentStep];

  const WalletConnectionPrompt = () => (
    <ConnectWalletPrompt>
      <div style={{ fontSize: '20px', marginBottom: '20px' }}>
        🔒 Wallet Required
      </div>
      <div style={{ marginBottom: '20px', lineHeight: '1.5' }}>
        To create your Flunks profile, you need to connect your wallet first.
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          onClick={() => setShowAuthFlow(true)}
          style={{
            background: '#a855f7',
            border: '2px solid #c084fc',
            color: '#fff',
            fontWeight: 'bold',
            padding: '10px 20px'
          }}
        >
          🚀 Connect Wallet
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            style={{
              background: '#666',
              border: '2px solid #999',
              color: '#fff',
              padding: '10px 20px'
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </ConnectWalletPrompt>
  );

  return (
    <RPGContainer $backgroundPattern={backgroundPattern}>
      <CharacterSprite />
      
      <DialogueBox variant="window">
        <div style={{ marginBottom: '10px' }}>
          {config.prompt}
        </div>
      </DialogueBox>

      {currentStep === 'confirm' ? (
        renderConfirmationScreen()
      ) : currentStep === 'success' ? (
        renderSuccessScreen()
      ) : (
        <>
          {currentStep === 'username' ? (
            <UsernameContainer>
              <AstroLogo src="/images/icons/astro-mascot.png" alt="Flunks Astronaut" />
              <NameBox>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7, fontSize: '14px' }}>
                    {config.title.toUpperCase()}:
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>
                    {currentInput.length}/{config.maxLength}
                  </span>
                </div>
                <div style={{ marginTop: '2px' }}>
                  <NameInput
                    type="text"
                    value={currentInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= config.maxLength) {
                        setCurrentInput(value);
                        setValidationMessage(''); // Clear validation on input
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isValidating && !isSubmitting) {
                        handleNext();
                      }
                    }}
                    placeholder={config.placeholder}
                    maxLength={config.maxLength}
                    autoFocus
                  />
                </div>
              </NameBox>
            </UsernameContainer>
          ) : (
            <UsernameContainer>
              <AstroLogo src="/images/icons/astro-mascot.png" alt="Flunks Astronaut" />
              <NameBox>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7, fontSize: '14px' }}>
                    {config.title.toUpperCase()}:
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>
                    {currentInput.length}/{config.maxLength}
                  </span>
                </div>
                <div style={{ marginTop: '2px' }}>
                  <NameInput
                    type={currentStep === 'email' ? 'email' : 'text'}
                    value={currentInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= config.maxLength) {
                        setCurrentInput(value);
                        setValidationMessage(''); // Clear validation on input
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isValidating && !isSubmitting) {
                        handleNext();
                      }
                    }}
                    placeholder={config.placeholder}
                    maxLength={config.maxLength}
                    autoFocus
                  />
                </div>
              </NameBox>
            </UsernameContainer>
          )}

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

          <div style={{ textAlign: 'center', marginTop: '2px', marginBottom: '6px' }}>
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
        marginTop: '6px',
        padding: '8px',
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
            disabled={isValidating || isSubmitting || (stepConfig[currentStep].required && currentStep !== 'confirm' && !currentInput.trim())}
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
          marginTop: '4px', 
          fontSize: '12px', 
          color: '#999',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px'
        }}>
          {['username', 'discord', 'email', 'confirm', 'success'].map((step, index) => (
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
        
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .cursor {
          animation: blink 1s infinite;
        }
      `}</style>

      {/* Show wallet address at bottom when connected */}
      {activeWallet && (
        <WalletDisplay>
          💰 Wallet: {activeWallet.address ? 
            `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}` : 
            'Connected'
          }
        </WalletDisplay>
      )}

      {/* Show connection prompt when no wallet */}
      {!hasWallet && <WalletConnectionPrompt />}
    </RPGContainer>
  );
};

export default RPGProfileForm;
