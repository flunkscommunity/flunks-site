import React, { useState, useEffect } from 'react';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import { Button, Frame, TextField, Separator } from 'react95';
import styled from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// Styled components for retro report card look
const ReportCardContainer = styled.div`
  background: #f8f8f0;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
`;

const ReportCardHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
`;

const SchoolHeader = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ReportCardTitle = styled.h2`
  font-size: 16px;
  margin: 5px 0;
  text-decoration: underline;
`;

const StudentInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  .info-line {
    border-bottom: 1px solid #000;
    padding: 5px 0;
    display: flex;
    align-items: center;
    
    .label {
      font-weight: bold;
      margin-right: 10px;
      min-width: 80px;
    }
    
    .value {
      flex: 1;
      font-family: 'Courier New', monospace;
    }
  }
`;

const GradeSection = styled.div`
  margin-bottom: 25px;
  
  .section-title {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 10px;
    text-decoration: underline;
  }
`;

const TextAreaSection = styled.div`
  margin-bottom: 20px;
  
  .section-label {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  
  .text-area {
    width: 100%;
    min-height: 100px;
    border: 1px solid #000;
    background: white;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    padding: 8px;
    resize: vertical;
    line-height: 1.4;
  }
`;

const GradeDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  
  .logo-emboss {
    width: 120px;
    height: 80px;
    background: linear-gradient(145deg, #f0f0f0, #d0d0d0);
    border: 2px solid #999;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      inset 2px 2px 4px rgba(255, 255, 255, 0.8),
      inset -2px -2px 4px rgba(0, 0, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.2);
    
    .logo-text {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      font-family: 'Arial Black', Arial, sans-serif;
      text-shadow: 
        1px 1px 0px rgba(255, 255, 255, 0.8),
        -1px -1px 0px rgba(0, 0, 0, 0.3);
      letter-spacing: 2px;
      transform: perspective(100px) rotateX(15deg);
    }
  }
`;

const SignatureSection = styled.div`
  margin-top: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  
  .signature-line {
    border-bottom: 1px solid #000;
    padding: 20px 0 5px 0;
    text-align: center;
    font-size: 10px;
    text-transform: uppercase;
  }
`;

const ReportCard: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { user, primaryWallet } = useDynamicContext();
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [issuesFound, setIssuesFound] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Set current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);

    // Set user name from Dynamic context if available
    if (user?.userId) {
      setUserName(user.userId);
    } else if (primaryWallet?.address) {
      setUserName(primaryWallet.address);
    }
  }, [user, primaryWallet]);

  const handleSubmit = async () => {
    if (issuesFound.trim() === '' && suggestions.trim() === '') {
      alert('Please fill in at least one field');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName || 'Anonymous',
          issues_found: issuesFound.trim() || null,
          suggestions: suggestions.trim() || null,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setIssuesFound('');
        setSuggestions('');
        alert('Feedback submitted successfully! Thank you for helping improve Flunks! 🎉');
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        setSubmitStatus('error');
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear this feedback form?')) {
      setUserName(user?.userId || primaryWallet?.address || '');
      setIssuesFound('');
      setSuggestions('');
      setSubmitStatus(null);
    }
  };

  return (
    <DraggableResizeableWindow
      headerTitle="Report Card"
      headerIcon="/images/icons/report-card.png"
      windowsId={WINDOW_IDS.REPORT_CARD}
      onClose={() => closeWindow(WINDOW_IDS.REPORT_CARD)}
      initialWidth="600px"
      initialHeight="700px"
      resizable={true}
    >
      <ReportCardContainer className="report-card-container">
        <ReportCardHeader>
          <SchoolHeader>Flunks High School</SchoolHeader>
          <ReportCardTitle>Feedback Form</ReportCardTitle>
          <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
            "Help us make Flunks even better!"
          </div>
        </ReportCardHeader>

        <StudentInfo>
          <div className="info-line" style={{ gridColumn: '1 / -1' }}>
            <span className="label">User:</span>
            <TextField
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              style={{ width: '100%', fontSize: '14px', padding: '8px' }}
            />
          </div>
        </StudentInfo>

        <GradeSection>
          <div className="section-title" style={{ textAlign: 'center' }}>Feedback Form</div>
          <GradeDisplay>
            <div className="logo-emboss">
              <span className="logo-text">FLUNKS</span>
            </div>
          </GradeDisplay>
          <div style={{ textAlign: 'center', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
            "Help us improve the Flunks experience!" �
          </div>
        </GradeSection>

        <Separator />

        <TextAreaSection>
          <div className="section-label">� What did you find that is wrong? Please describe in detail!</div>
          <textarea
            className="text-area"
            value={issuesFound}
            onChange={(e) => setIssuesFound(e.target.value)}
            placeholder="Tell us about any bugs, issues, broken features, or problems you encountered. Be as detailed as possible - include what you were trying to do, what happened instead, and any error messages you saw..."
          />
        </TextAreaSection>

        <TextAreaSection>
          <div className="section-label">� Any other suggestions for the website or project in general?</div>
          <textarea
            className="text-area"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            placeholder="Share your ideas for improvements, new features, design changes, or anything else that would make the Flunks experience better. We value all feedback and suggestions!"
          />
        </TextAreaSection>

        <Separator />

        <SignatureSection>
          <div className="signature-line">Student Signature</div>
          <div className="signature-line">Parent/Guardian Signature</div>
        </SignatureSection>

        <div className="report-card-buttons" style={{ marginTop: '20px' }}>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '� Submitting...' : '📤 Submit Feedback'}
          </Button>
          <Button onClick={handleClear} disabled={isSubmitting}>
            🗑️ Clear
          </Button>
          <Button onClick={() => closeWindow(WINDOW_IDS.REPORT_CARD)}>
            ✖️ Close
          </Button>
        </div>

        {submitStatus === 'success' && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px',
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            textAlign: 'center',
            fontSize: '12px'
          }}>
            ✅ Feedback submitted successfully! Thank you for helping improve Flunks!
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            textAlign: 'center',
            fontSize: '12px'
          }}>
            ❌ Failed to submit feedback. Please try again.
          </div>
        )}

        <div style={{ 
          marginTop: '15px', 
          fontSize: '10px', 
          textAlign: 'center', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Your feedback helps us build a better Flunks experience for everyone! 🎓✨
        </div>
      </ReportCardContainer>
    </DraggableResizeableWindow>
  );
};

export default ReportCard;
