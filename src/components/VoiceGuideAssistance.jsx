import { useEffect, useMemo, useState } from 'react';
import './VoiceGuideAssistance.css';

const STEPS = [
    {
        id: 'report-button',
        selector: '[data-guide-id="report-button"]',
        text: 'Step 1. Click the blue Report an Issue button to open the report form.',
    },
    {
        id: 'full-name',
        selector: '[data-guide-id="full-name"]',
        text: 'Step 2. Please enter your full name and press Enter.',
    },
    {
        id: 'phone-input',
        selector: '[data-guide-id="phone-input"]',
        text: 'Step 3. Enter your 10-digit phone number and press Enter.',
    },
    {
        id: 'email-input',
        selector: '[data-guide-id="email-input"]',
        text: 'Step 4. Enter your email address and press Enter.',
    },
    {
        id: 'maps-link',
        selector: '[data-guide-id="maps-link"]',
        text: 'Step 5. Share a Google Maps link of the location (Optional). Press Enter to proceed.',
    },
    {
        id: 'area-input',
        selector: '[data-guide-id="area-input"]',
        text: 'Step 6. Enter the area or locality name and press Enter.',
    },
    {
        id: 'city-input',
        selector: '[data-guide-id="city-input"]',
        text: 'Step 7. Enter the city name and press Enter.',
    },
    {
        id: 'landmark-input',
        selector: '[data-guide-id="landmark-input"]',
        text: 'Step 8. Enter a nearby landmark (Optional) and press Enter.',
    },
    {
        id: 'issue-type',
        selector: '[data-guide-id="issue-type"]',
        text: 'Step 9. Select the issue type from the dropdown and press Enter to confirm.',
    },
    {
        id: 'description',
        selector: '[data-guide-id="description"]',
        text: 'Step 10. Describe the problem in the text box and press Enter.',
    },
    {
        id: 'file-upload',
        selector: '[data-guide-id="file-upload"]',
        text: 'Step 11. Upload a photo (Optional). Press Enter to proceed.',
    },
    {
        id: 'severity-input',
        selector: '[data-guide-id="severity-input"]',
        text: 'Step 12. Select how serious the issue is and press Enter.',
    },
    {
        id: 'duration-input',
        selector: '[data-guide-id="duration-input"]',
        text: 'Step 13. How long has this issue existed? Enter details and press Enter.',
    },
    {
        id: 'volunteer-input',
        selector: '[data-guide-id="volunteer-input"]',
        text: 'Step 14. Allow nearby volunteers to help? Click Yes or No to proceed.',
    },
    {
        id: 'updates-input',
        selector: '[data-guide-id="updates-input"]',
        text: 'Step 15. Want updates on this issue? Click Yes or No to proceed.',
    },
    {
        id: 'consent-input',
        selector: '[data-guide-id="consent-input"]',
        text: 'Step 16. Verify the info and consent by checking the box to proceed.',
    },
    {
        id: 'submit-report',
        selector: '[data-guide-id="submit-report"]',
        text: 'Step 17. Finally, click Submit Report or press Enter.',
    },
];

const VoiceGuideAssistant = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const step = useMemo(() => STEPS[stepIndex], [stepIndex]);
    const isLastStep = stepIndex === STEPS.length - 1;

    const advanceStep = () => {
        setStepIndex((prev) => {
            if (prev >= STEPS.length - 1) return prev;
            return prev + 1;
        });
    };

    useEffect(() => {
        if (!isRunning) return;
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(step.text);
        utterance.rate = 1.1; 
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, [isRunning, step]);

    useEffect(() => {
        if (!isCompleted) return;
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
            'Great job. Your report is ready to be submitted. The guide is completed.'
        );
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, [isCompleted]);

    useEffect(() => {
        document.querySelectorAll('.guide-highlight').forEach((el) => {
            el.classList.remove('guide-highlight');
        });

        if (!isRunning) return;
        let target = null;
        let isCleaned = false;

        const applyHighlight = () => {
            if (isCleaned) return;
            target = document.querySelector(step.selector);
            if (!target) return;
            target.classList.add('guide-highlight');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        applyHighlight();
        const timer = window.setInterval(applyHighlight, 350);

        return () => {
            isCleaned = true;
            window.clearInterval(timer);
            if (target) target.classList.remove('guide-highlight');
        };
    }, [isRunning, step]);

    useEffect(() => {
        if (!isRunning) return;

        const completeStep = () => {
            if (isLastStep) {
                setIsRunning(false);
                setIsCompleted(true);
                return;
            }
            advanceStep();
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const target = document.querySelector(step.selector);
                
                if (step.id !== 'submit-report') {
                    e.preventDefault();
                }

                // Phone Validation
                if (step.id === 'phone-input' && target) {
                    const digits = target.value.replace(/\D/g, '');
                    if (digits.length < 10) {
                        const utterance = new SpeechSynthesisUtterance('Please enter at least 10 digits.');
                        window.speechSynthesis.speak(utterance);
                        return;
                    }
                }

                completeStep();
            }
        };

        const handleClickOrChange = (e) => {
            const target = document.querySelector(step.selector);
            if (!target) return;

            // Handle selection-based steps (No Enter required)
            if (step.id === 'volunteer-input' || step.id === 'updates-input') {
                // If user clicks a radio input within the target container
                if (e.target.type === 'radio' && target.contains(e.target)) {
                    // Small delay to ensure the radio selection visual registers for the user
                    setTimeout(completeStep, 300);
                }
            } else if (step.id === 'consent-input') {
                // If user checks the consent checkbox
                if (e.target.type === 'checkbox' && e.target.checked && target === e.target) {
                    setTimeout(completeStep, 300);
                }
            } else if (target.contains(e.target)) {
                // Original click-to-advance logic for buttons
                if (step.id === 'report-button' || step.id === 'submit-report') {
                    completeStep();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleClickOrChange);
        window.addEventListener('change', handleClickOrChange);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', handleClickOrChange);
            window.removeEventListener('change', handleClickOrChange);
        };
    }, [isRunning, step, isLastStep]);

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const startGuide = () => {
        setStepIndex(0);
        setIsCompleted(false);
        setIsRunning(true);
    };

    const stopGuide = () => {
        setIsRunning(false);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    return (
        <div className="voice-guide-widget">
            <h3>Voice Assistant Guide</h3>
            <p className="guide-step-text">
                {isRunning
                    ? step.text
                    : isCompleted
                        ? 'Guide completed. Your report is ready.'
                        : 'Press Start Guide to hear instructions.'}
            </p>
            <div className="guide-actions">
                <button type="button" className="btn btn-primary" onClick={startGuide}>
                    Start Guide
                </button>
                <button type="button" className="btn" onClick={stopGuide} disabled={!isRunning}>
                    Stop
                </button>
            </div>
        </div>
    );
};

export default VoiceGuideAssistant;
