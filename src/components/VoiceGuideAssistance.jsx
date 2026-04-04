import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MoveUpRight, Navigation } from 'lucide-react';
import './VoiceGuideAssistance.css';

const STEPS = [
    {
        id: 'report-button',
        selector: '[data-guide-id="report-button"]',
        text: 'Step 1. Starting the guide. Please click the blue "Report an Issue" button to open the form.',
    },
    {
        id: 'full-name',
        selector: '[data-guide-id="full-name"]',
        text: 'Step 2. Personal details. Type your full name and press Enter.',
    },
    {
        id: 'phone-input',
        selector: '[data-guide-id="phone-input"]',
        text: 'Step 3. Enter your 10-digit mobile number and press Enter.',
    },
    {
        id: 'email-input',
        selector: '[data-guide-id="email-input"]',
        text: 'Step 4. Enter your email address and press Enter.',
    },
    {
        id: 'language-input',
        selector: '[data-guide-id="language-input"]',
        text: 'Step 5. Select your preferred language from the list and press Enter.',
    },
    {
        id: 'maps-link',
        selector: '[data-guide-id="maps-link"]',
        text: 'Step 6. Location. If you have a Google Maps link, paste it here, or just press Enter to skip.',
    },
    {
        id: 'area-input',
        selector: '[data-guide-id="area-input"]',
        text: 'Step 7. Type the name of your area or locality and press Enter.',
    },
    {
        id: 'city-input',
        selector: '[data-guide-id="city-input"]',
        text: 'Step 8. Type the name of your city and press Enter.',
    },
    {
        id: 'landmark-input',
        selector: '[data-guide-id="landmark-input"]',
        text: 'Step 9. Enter a nearby landmark (optional) and press Enter.',
    },
    {
        id: 'issue-type',
        selector: '[data-guide-id="issue-type"]',
        text: 'Step 10. Issue details. Select the type of problem you are reporting and press Enter.',
    },
    {
        id: 'description',
        selector: '[data-guide-id="description"]',
        text: 'Step 11. Describe the problem in your own words so we understand it better. Press Enter when done.',
    },
    {
        id: 'file-upload',
        selector: '[data-guide-id="file-upload"]',
        text: 'Step 12. Upload a photo of the issue (optional). Once selected, or to skip, press Enter.',
    },
    {
        id: 'severity-input',
        selector: '[data-guide-id="severity-input"]',
        text: 'Step 13. How serious is the issue? Use arrow keys to choose or click and press Enter.',
    },
    {
        id: 'duration-input',
        selector: '[data-guide-id="duration-input"]',
        text: 'Step 14. How long has this issue existed? Enter duration and press Enter.',
    },
    {
        id: 'volunteer-input',
        selector: '[data-guide-id="volunteer-input"]',
        text: 'Step 15. Allow nearby volunteers to help? Select Yes or No to proceed.',
    },
    {
        id: 'updates-input',
        selector: '[data-guide-id="updates-input"]',
        text: 'Step 16. Want updates on this issue? Select Yes or No to proceed.',
    },
    {
        id: 'consent-input',
        selector: '[data-guide-id="consent-input"]',
        text: 'Step 17. Almost there. Check the box to verify your information and proceed.',
    },
    {
        id: 'submit-report',
        selector: '[data-guide-id="submit-report"]',
        text: 'Step 18. Final step. Click "Submit Report" or press Enter to send your request.',
    },
    {
        id: 'issue-id-display',
        selector: '[data-guide-id="issue-id-display"]',
        text: 'Step 19. Your complaint has been recorded and updated. This is your unique code. Please copy it now.',
    },
    {
        id: 'track-link',
        selector: '[data-guide-id="track-link"]',
        text: 'Step 20. Last step. Click "Track Status" in the menu above anytime to check for updates. The guide is now complete.',
    },
];

const VoiceGuideAssistant = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [pointerPos, setPointerPos] = useState({ top: 0, left: 0, visible: false });

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

        // 🎙️ Robust Speech Manager
        const speak = () => {
            window.speechSynthesis.cancel();
            
            // Short delay to ensure browser speech engine is ready after cancel
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(step.text);
                utterance.rate = 1.1; 
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
            }, 150);
        };

        speak();
    }, [isRunning, step]);

    useEffect(() => {
        if (!isCompleted) return;
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(
                'The guide is now complete. You can track your complaint status anytime from the top menu.'
            );
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }, 150);
    }, [isCompleted]);

    useEffect(() => {
        document.querySelectorAll('.guide-highlight').forEach((el) => {
            el.classList.remove('guide-highlight');
        });

        if (!isRunning) {
            setPointerPos({ ...pointerPos, visible: false });
            return;
        }

        let target = null;
        let isCleaned = false;

        const applyHighlight = () => {
            if (isCleaned) return;
            target = document.querySelector(step.selector);
            if (!target) {
                setPointerPos(prev => ({ ...prev, visible: false }));
                return;
            }

            // Apply highlight and scroll
            target.classList.add('guide-highlight');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Calculate pointer position
            const rect = target.getBoundingClientRect();
            setPointerPos({
                top: rect.top + window.scrollY + (rect.height / 2),
                left: rect.left + window.scrollX - 40, // Position to the left of the box
                visible: true
            });

            // Focus the element
            if (document.activeElement !== target) {
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                    target.focus();
                }
            }
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

        // 🕵️ Success Monitor
        // If we are on the Submit step, we wait for the success screen to appear
        let successInterval = null;
        if (step.id === 'submit-report') {
            successInterval = setInterval(() => {
                const successEl = document.querySelector('[data-guide-id="issue-id-display"]');
                if (successEl) {
                    clearInterval(successInterval);
                    completeStep();
                }
            }, 500);
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const target = document.querySelector(step.selector);
                
                if (step.id !== 'submit-report') {
                    e.preventDefault();
                } else {
                    // Don't auto-advance on Enter for submit. Wait for Success Monitor.
                    return;
                }

                // Validation checks
                if (target) {
                    const value = target.value.trim();
                    if (step.id === 'full-name' && !value) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Please enter your name.'));
                        return;
                    }
                    if (step.id === 'phone-input') {
                        const digits = value.replace(/\D/g, '');
                        if (digits.length < 10) {
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Phone number must be at least 10 digits.'));
                            return;
                        }
                    }
                    if (step.id === 'description' && !value) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Please provide a short description.'));
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
            if (['severity-input', 'volunteer-input', 'updates-input'].includes(step.id)) {
                if (e.target.type === 'radio' && target.contains(e.target)) {
                    setTimeout(completeStep, 300);
                }
            } else if (step.id === 'issue-type') {
                if (e.target.tagName === 'SELECT' && target === e.target) {
                    setTimeout(completeStep, 300);
                }
            } else if (step.id === 'consent-input') {
                if (e.target.type === 'checkbox' && e.target.checked && target === e.target) {
                    setTimeout(completeStep, 300);
                }
            } else if (target.contains(e.target)) {
                if (['report-button', 'track-link'].includes(step.id)) {
                    completeStep();
                }
                // Submit button (Step 18) is handled by the Success Monitor above
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleClickOrChange);
        window.addEventListener('change', handleClickOrChange);

        return () => {
            if (successInterval) clearInterval(successInterval);
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
        <>
            {pointerPos.visible && (
                <div 
                    className="guide-pointer" 
                    style={{ 
                        top: `${pointerPos.top}px`, 
                        left: `${pointerPos.left}px` 
                    }}
                >
                    <Navigation size={32} fill="#2563eb" color="#fff" strokeWidth={2} />
                    <span className="pointer-text">HERE</span>
                </div>
            )}
            
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
        </>
    );
};

export default VoiceGuideAssistant;
