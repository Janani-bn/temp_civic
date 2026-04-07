import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Navigation } from 'lucide-react';
import './VoiceGuideAssistant.css';

const STEPS_EN = [
    { id: 'report-button', selector: '[data-guide-id="report-button"]', text: 'Step 1. Starting the guide. Please click the blue "Report an Issue" button to open the dashboard.' },
    { id: 'recommendation-title', selector: '[data-guide-id="recommendation-title"]', text: 'Step 2. Smart Duplicate Check. We found some similar issues in your area. Is your issue the same as any of these? If so, click "Yes, Join This" to add your support. If you are not joining, click "No, Report a Different Issue" to continue.' },
    { id: 'full-name', selector: '[data-guide-id="full-name"]', text: 'Step 3. Personal Details. Type your full name and press Enter.' },
    { id: 'phone-input', selector: '[data-guide-id="phone-input"]', text: 'Step 4. Enter your 10-digit mobile number and press Enter.' },
    { id: 'email-input', selector: '[data-guide-id="email-input"]', text: 'Step 5. Enter your email address and press Enter.' },
    { id: 'language-input', selector: '[data-guide-id="language-input"]', text: 'Step 6. Select your preferred language from the list and press Enter.' },
    { id: 'maps-link', selector: '[data-guide-id="maps-link"]', text: 'Step 7. Location. If you have a Google Maps link, paste it here, or just press Enter to skip.' },
    { id: 'area-input', selector: '[data-guide-id="area-input"]', text: 'Step 8. Type your area or locality name and press Enter.' },
    { id: 'city-input', selector: '[data-guide-id="city-input"]', text: 'Step 9. Type your city name and press Enter.' },
    { id: 'landmark-input', selector: '[data-guide-id="landmark-input"]', text: 'Step 10. Enter a nearby landmark (optional) and press Enter.' },
    { id: 'issue-type', selector: '[data-guide-id="issue-type"]', text: 'Step 11. Issue Details. Select the type of issue you are reporting and press Enter.' },
    { id: 'description', selector: '[data-guide-id="description"]', text: 'Step 12. Describe the issue in your own words so we can understand it better. Press Enter when done.' },
    { id: 'file-upload', selector: '[data-guide-id="file-upload"]', text: 'Step 13. Upload a photo of the issue (optional). After selecting, or to skip, press Enter.' },
    { id: 'severity-input', selector: '[data-guide-id="severity-input"]', text: 'Step 14. How serious is the issue? Select an option by clicking it.' },
    { id: 'duration-input', selector: '[data-guide-id="duration-input"]', text: 'Step 15. How long has this issue existed? Enter the duration and press Enter.' },
    { id: 'volunteer-input', selector: '[data-guide-id="volunteer-input"]', text: 'Step 16. Allow nearby volunteers to help? Choose Yes or No.' },
    { id: 'updates-input', selector: '[data-guide-id="updates-input"]', text: 'Step 17. Want updates on this issue? Choose Yes or No.' },
    { id: 'consent-input', selector: '[data-guide-id="consent-input"]', text: 'Step 18. Just a bit more. Check the box to verify your information.' },
    { id: 'submit-report', selector: '[data-guide-id="submit-report"]', text: 'Step 19. Final Step. Click "Submit Report" or press Enter to send your request.' },
    { id: 'issue-id-display', selector: '[data-guide-id="issue-id-display"]', text: 'Step 20. Your complaint has been registered. This is your unique code. Please copy it now.' },
    { id: 'track-link', selector: '[data-guide-id="track-link"]', text: 'Step 21. Last step. Click "Track Status" in the menu above anytime to see updates. The guide is now complete.' },
];

const STEPS_TA = [
    { id: 'report-button', selector: '[data-guide-id="report-button"]', text: 'படி 1. வழிகாட்டி தொடங்குகிறது. டாஷ்போர்டைத் திறக்க நீல நிற "Report an Issue" பொத்தானைக் கிளிக் செய்யவும்.' },
    { id: 'recommendation-title', selector: '[data-guide-id="recommendation-title"]', text: 'படி 2. ஸ்மார்ட் நகல் சரிபார்ப்பு. உங்கள் பகுதியில் இதுபோன்ற சில சிக்கல்களை நாங்கள் கண்டறிந்துள்ளோம். உங்கள் பிரச்சினையும் இவற்றில் ஏதேனும் ஒன்றைப் போன்றதா? ஆம் எனில், உங்கள் ஆதரவைச் சேர்க்க "Yes, Join This" என்பதைக் கிளிக் செய்யவும். நீங்கள் சேரவில்லை என்றால், தொடர "No, Report a Different Issue" என்பதைக் கிளிக் செய்யவும்.' },
    { id: 'full-name', selector: '[data-guide-id="full-name"]', text: 'படி 3. தனிப்பட்ட விவரங்கள். உங்கள் முழுப் பெயரையும் தட்டச்சு செய்து என்டர் அழுத்தவும்.' },
    { id: 'phone-input', selector: '[data-guide-id="phone-input"]', text: 'படி 4. உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிட்டு என்டர் அழுத்தவும்.' },
    { id: 'email-input', selector: '[data-guide-id="email-input"]', text: 'படி 5. உங்கள் மின்னஞ்சல் முகவரியை உள்ளிட்டு என்டர் அழுத்தவும்.' },
    { id: 'language-input', selector: '[data-guide-id="language-input"]', text: 'படி 6. பட்டியலிலிருந்து உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுத்து என்டர் அழுத்தவும்.' },
    { id: 'maps-link', selector: '[data-guide-id="maps-link"]', text: 'படி 7. இருப்பிடம். உங்களிடம் கூகுள் மேப்ஸ் லிங்க் இருந்தால், அதை இங்கே ஒட்டவும் அல்லது தவிர்க்க என்டர் அழுத்தவும்.' },
    { id: 'area-input', selector: '[data-guide-id="area-input"]', text: 'படி 8. உங்கள் பகுதி அல்லது வட்டாரத்தின் பெயரைத் தட்டச்சு செய்து என்டர் அழுத்தவும்.' },
    { id: 'city-input', selector: '[data-guide-id="city-input"]', text: 'படி 9. உங்கள் நகரத்தின் பெயரைத் தட்டச்சு செய்து என்டர் அழுத்தவும்.' },
    { id: 'landmark-input', selector: '[data-guide-id="landmark-input"]', text: 'படி 10. அருகிலுள்ள அடையாளத்தை (விரும்பினால்) உள்ளிட்டு என்டர் அழுத்தவும்.' },
    { id: 'issue-type', selector: '[data-guide-id="issue-type"]', text: 'படி 11. பிரச்சனை விவரங்கள். நீங்கள் புகாரளிக்கும் பிரச்சினையின் வகையைத் தேர்ந்தெடுத்து என்டர் அழுத்தவும்.' },
    { id: 'description', selector: '[data-guide-id="description"]', text: 'படி 12. சிக்கலை உங்கள் சொந்த வார்த்தைகளில் விவரிக்கவும். முடிந்ததும் என்டர் அழுத்தவும்.' },
    { id: 'file-upload', selector: '[data-guide-id="file-upload"]', text: 'படி 13. பிரச்சினையின் புகைப்படத்தைப் பதிவேற்றவும் (விரும்பினால்). தேர்ந்தெடுத்த பிறகு, அல்லது தவிர்க்க, என்டர் அழுத்தவும்.' },
    { id: 'severity-input', selector: '[data-guide-id="severity-input"]', text: 'படி 14. பிரச்சனை எவ்வளவு தீவிரமானது? ஒரு விருப்பத்தைக் கிளிக் செய்வதன் மூலம் அதைத் தேர்ந்தெடுக்கவும்.' },
    { id: 'duration-input', selector: '[data-guide-id="duration-input"]', text: 'படி 15. இந்தப் பிரச்சனை எவ்வளவு காலமாக உள்ளது? கால அளவை உள்ளிட்டு என்டர் அழுத்தவும்.' },
    { id: 'volunteer-input', selector: '[data-guide-id="volunteer-input"]', text: 'படி 16. அருகிலுள்ள தன்னார்வலர்களை உதவ அனுமதிக்கவா? ஆம் அல்லது இல்லை என்பதைத் தேர்வு செய்யவும்.' },
    { id: 'updates-input', selector: '[data-guide-id="updates-input"]', text: 'படி 17. இந்தப் பிரச்சனை குறித்த அறிவிப்புகள் வேண்டுமா? ஆம் அல்லது இல்லை என்பதைத் தேர்வு செய்யவும்.' },
    { id: 'consent-input', selector: '[data-guide-id="consent-input"]', text: 'படி 18. இன்னும் சிறிதுதான். உங்கள் தகவலைச் சரிபார்க்க பெட்டியைத் தேர்ந்தெடுக்கவும்.' },
    { id: 'submit-report', selector: '[data-guide-id="submit-report"]', text: 'படி 19. இறுதிப் படி. உங்கள் கோரிக்கையை அனுப்ப "Submit Report" என்பதைக் கிளிக் செய்யவும் அல்லது என்டர் அழுத்தவும்.' },
    { id: 'issue-id-display', selector: '[data-guide-id="issue-id-display"]', text: 'படி 20. உங்கள் புகார் பதிவு செய்யப்பட்டுள்ளது. இது உங்கள் தனித்துவமான குறியீடு. தயவுசெய்து இப்போது நகலெடுக்கவும்.' },
    { id: 'track-link', selector: '[data-guide-id="track-link"]', text: 'படி 21. கடைசி படி. புதுப்பிப்புகளைப் பார்க்க எந்த நேரத்திலும் மேலே உள்ள மெனுவில் "Track Status" என்பதைக் கிளிக் செய்யவும். வழிகாட்டி இப்போது முடிந்தது.' },
];

const STEPS_HI = [
    { id: 'report-button', selector: '[data-guide-id="report-button"]', text: 'चरण 1. गाइड शुरू हो रहा है। डैशबोर्ड खोलने के लिए कृपया नीले रंग के "Report an Issue" बटन पर क्लिक करें।' },
    { id: 'recommendation-title', selector: '[data-guide-id="recommendation-title"]', text: 'चरण 2. स्मार्ट डुप्लिकेट जांच। हमें आपके क्षेत्र में कुछ इसी तरह की समस्याएं मिली हैं। क्या आपकी समस्या भी इनमें से किसी एक जैसी है? यदि हाँ, तो अपना समर्थन जोड़ने के लिए "Yes, Join This" पर क्लिक करें। यदि आप इसमें शामिल नहीं हो रहे हैं, तो आगे बढ़ने के लिए "No, Report a Different Issue" पर क्लिक करें।' },
    { id: 'full-name', selector: '[data-guide-id="full-name"]', text: 'चरण 3. व्यक्तिगत विवरण। अपना पूरा नाम टाइप करें और एंटर दबाएं।' },
    { id: 'phone-input', selector: '[data-guide-id="phone-input"]', text: 'चरण 4. अपना 10-अंकीय मोबाइल नंबर दर्ज करें और एंटर दबाएं।' },
    { id: 'email-input', selector: '[data-guide-id="email-input"]', text: 'चरण 5. अपना ईमेल पता दर्ज करें और एंटर दबाएं।' },
    { id: 'language-input', selector: '[data-guide-id="language-input"]', text: 'चरण 6. सूची से अपनी पसंदीदा भाषा चुनें और एंटर दबाएं।' },
    { id: 'maps-link', selector: '[data-guide-id="maps-link"]', text: 'चरण 7. स्थान। यदि आपके पास Google मानचित्र लिंक है, तो उसे यहाँ पेस्ट करें, या छोड़ने के लिए बस एंटर दबाएं।' },
    { id: 'area-input', selector: '[data-guide-id="area-input"]', text: 'चरण 8. अपने क्षेत्र या इलाके का नाम टाइप करें और एंटर दबाएं।' },
    { id: 'city-input', selector: '[data-guide-id="city-input"]', text: 'चरण 9. अपने शहर का नाम टाइप करें और एंटर दबाएं।' },
    { id: 'landmark-input', selector: '[data-guide-id="landmark-input"]', text: 'चरण 10. पास का कोई लैंडमार्क (वैकल्पिक) दर्ज करें और एंटर दबाएं।' },
    { id: 'issue-type', selector: '[data-guide-id="issue-type"]', text: 'चरण 11. समस्या का विवरण। आप जिस प्रकार की समस्या की रिपोर्ट कर रहे हैं उसे चुनें और एंटर दबाएं।' },
    { id: 'description', selector: '[data-guide-id="description"]', text: 'चरण 12. समस्या का अपनी भाषा में वर्णन करें ताकि हम इसे बेहतर ढंग से समझ सकें। पूरा होने पर एंटर दबाएं।' },
    { id: 'file-upload', selector: '[data-guide-id="file-upload"]', text: 'चरण 13. समस्या की एक फोटो अपलोड करें (वैकल्पिक)। चुनने के बाद, या छोड़ने के लिए, एंटर दबाएं।' },
    { id: 'severity-input', selector: '[data-guide-id="severity-input"]', text: 'चरण 14. समस्या कितनी गंभीर है? किसी विकल्प पर क्लिक करके उसे चुनें।' },
    { id: 'duration-input', selector: '[data-guide-id="duration-input"]', text: 'चरण 15. यह समस्या कितने समय से मौजूद है? अवधि दर्ज करें और एंटर दबाएं।' },
    { id: 'volunteer-input', selector: '[data-guide-id="volunteer-input"]', text: 'चरण 16. क्या पास के स्वयंसेवकों को मदद करने की अनुमति दें? हाँ (Yes) या नहीं (No) चुनें।' },
    { id: 'updates-input', selector: '[data-guide-id="updates-input"]', text: 'चरण 17. क्या इस समस्या पर अपडेट चाहते हैं? हाँ (Yes) या नहीं (No) चुनें।' },
    { id: 'consent-input', selector: '[data-guide-id="consent-input"]', text: 'चरण 18. बस थोड़ा और। अपनी जानकारी सत्यापित करने के लिए बॉक्स को चेक करें।' },
    { id: 'submit-report', selector: '[data-guide-id="submit-report"]', text: 'चरण 19. अंतिम चरण। अपनी रिपोर्ट भेजने के लिए "Submit Report" पर क्लिक करें या एंटर दबाएं।' },
    { id: 'issue-id-display', selector: '[data-guide-id="issue-id-display"]', text: 'चरण 20. आपकी शिकायत दर्ज कर ली गई है। यह आपका यूनिक कोड है। कृपया इसे अभी कॉपी करें।' },
    { id: 'track-link', selector: '[data-guide-id="track-link"]', text: 'चरण 21. आखिरी कदम। अपडेट देखने के लिए कभी भी ऊपर के मेनू में "Track Status" पर क्लिक करें। गाइड अब पूरा हो गया है।' },
];

const STEPS_TE = [
    { id: 'report-button', selector: '[data-guide-id="report-button"]', text: 'అడుగు 1. గైడ్‌ను ప్రారంభిస్తున్నాము. డ్యాష్‌బోర్డ్ తెరవడానికి దయచేసి నీలం రంగు "Report an Issue" బటన్‌ను క్లిక్ చేయండి.' },
    { id: 'recommendation-title', selector: '[data-guide-id="recommendation-title"]', text: 'అడుగు 2. స్మార్ట్ డూప్లికేట్ చెక్. మీ ప్రాంతంలో ఇలాంటి కొన్ని సమస్యలను మేము కనుగొన్నాము. మీ సమస్య కూడా వీటిలో ఒకదానితో సమానంగా ఉందా? అవును అయితే, మీ మద్దతును జోడించడానికి "Yes, Join This" క్లిక్ చేయండి. మీరు ఇందులో చేరకపోతే, కొనసాగడానికి "No, Report a Different Issue" క్లిక్ చేయండి.' },
    { id: 'full-name', selector: '[data-guide-id="full-name"]', text: 'అడుగు 3. వ్యక్తిగత వివరాలు. మీ పూర్తి పేరును టైప్ చేసి ఎంటర్ నొక్కండి.' },
    { id: 'phone-input', selector: '[data-guide-id="phone-input"]', text: 'అడుగు 4. మీ 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేసి ఎంటర్ నొక్కండి.' },
    { id: 'email-input', selector: '[data-guide-id="email-input"]', text: 'అడుగు 5. మీ ఇమెయిల్ చిరునామాను నమోదు చేసి ఎంటర్ నొక్కండి.' },
    { id: 'language-input', selector: '[data-guide-id="language-input"]', text: 'అడుగు 6. జాబితా నుండి మీకు ఇష్టమైన భాషను ఎంచుకుని ఎంటర్ నొక్కండి.' },
    { id: 'maps-link', selector: '[data-guide-id="maps-link"]', text: 'అడుగు 7. స్థానం. మీ దగ్గర గూగుల్ మ్యాప్స్ లింక్ ఉంటే, ఇక్కడ పేస్ట్ చేయండి లేదా దాటవేయడానికి ఎంటర్ నొక్కండి.' },
    { id: 'area-input', selector: '[data-guide-id="area-input"]', text: 'అడుగు 8. మీ ప్రాంతం లేదా మొహల్లా పేరును టైప్ చేసి ఎంటర్ నొక్కండి.' },
    { id: 'city-input', selector: '[data-guide-id="city-input"]', text: 'అడుగు 9. మీ నగరం పేరును టైప్ చేసి ఎంటర్ నొక్కండి.' },
    { id: 'landmark-input', selector: '[data-guide-id="landmark-input"]', text: 'అడుగు 10. సమీపంలోని ల్యాండ్‌మార్క్ (ఐచ్ఛికం) నమోదు చేసి ఎంటర్ నొక్కండి.' },
    { id: 'issue-type', selector: '[data-guide-id="issue-type"]', text: 'అడుగు 11. సమస్య వివరాలు. మీరు నివేదిస్తున్న సమస్య రకాన్ని ఎంచుకుని ఎంటర్ నొక్కండి.' },
    { id: 'description', selector: '[data-guide-id="description"]', text: 'అడుగు 12. సమస్యను మీ స్వంత మాటలలో వివరించండి. పూర్తయిన తర్వాత ఎంటర్ నొక్కండి.' },
    { id: 'file-upload', selector: '[data-guide-id="file-upload"]', text: 'అడుగు 13. సమస్య యొక్క ఫోటోను అప్‌లోడ్ చేయండి (ఐచ్ఛికం). ఎంచుకున్న తర్వాత లేదా దాటవేయడానికి ఎంటర్ నొక్కండి.' },
    { id: 'severity-input', selector: '[data-guide-id="severity-input"]', text: 'అడుగు 14. సమస్య ఎంత తీవ్రంగా ఉంది? దాన్ని క్లిక్ చేయడం ద్వారా ఒక ఎంపికను ఎంచుకోండి.' },
    { id: 'duration-input', selector: '[data-guide-id="duration-input"]', text: 'అడుగు 15. ఈ సమస్య ఎంతకాలం నుండి ఉంది? వ్యవధిని నమోదు చేసి ఎంటర్ నొక్కండి.' },
    { id: 'volunteer-input', selector: '[data-guide-id="volunteer-input"]', text: 'అడుగు 16. సమీపంలోని వాలంటీర్లను సహాయం చేయడానికి అనుమతించాలా? అవును (Yes) లేదా లేదు (No) ఎంచుకోండి.' },
    { id: 'updates-input', selector: '[data-guide-id="updates-input"]', text: 'అడుగు 17. ఈ సమస్యపై అప్‌డేట్‌లు కావాలా? అవును (Yes) లేదా లేదు (No) ఎంచుకోండి.' },
    { id: 'consent-input', selector: '[data-guide-id="consent-input"]', text: 'అడుగు 18. దాదాపు పూర్తయింది. మీ సమాచారాన్ని ధృవీకరించడానికి బాక్స్‌ను చెక్ చేయండి.' },
    { id: 'submit-report', selector: '[data-guide-id="submit-report"]', text: 'అడుగు 19. చివరి అడుగు. మీ అభ్యర్థనను పంపడానికి "Submit Report" క్లిక్ చేయండి లేదా ఎంటర్ నొక్కండి.' },
    { id: 'issue-id-display', selector: '[data-guide-id="issue-id-display"]', text: 'అడుగు 20. మీ ఫిర్యాదు నమోదు చేయబడింది. ఇది మీ ప్రత్యేక కోడ్. దయచేసి దీన్ని ఇప్పుడే కాపీ చేయండి.' },
    { id: 'track-link', selector: '[data-guide-id="track-link"]', text: 'అడుగు 21. చివరి అడుగు. అప్‌డేట్‌ల కోసం ఎప్పుడైనా పైన ఉన్న మెనూలో "Track Status" క్లిక్ చేయండి. గైడ్ ఇప్పుడు పూర్తయింది.' },
];

const STEPS_ML = [
    { id: 'report-button', selector: '[data-guide-id="report-button"]', text: 'ഘട്ടം 1. ഗൈഡ് ആരംഭിക്കുന്നു. ഡാഷ്‌ബോർഡ് തുറക്കുന്നതിന് ദയവായി നീലനിറത്തിലുള്ള "Report an Issue" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.' },
    { id: 'recommendation-title', selector: '[data-guide-id="recommendation-title"]', text: 'ഘട്ടം 2. സ്മാർട്ട് ഡ്യൂപ്ലികെറ്റ് ചെക്ക്. നിങ്ങളുടെ പ്രദേശത്ത് സമാനമായ ചില പ്രശ്നങ്ങൾ ഞങ്ങൾ കണ്ടെത്തിയിട്ടുണ്ട്. നിങ്ങളുടെ പ്രശ്നം ഇവയിലേതെങ്കിലും ഒന്നിനോട് സാമ്യമുള്ളതാണോ? ഉണ്ടെങ്കിൽ, നിങ്ങളുടെ പിന്തുണ ചേർക്കുന്നതിന് "Yes, Join This" ക്ലിക്ക് ചെയ്യുക. നിങ്ങൾ ഇതിൽ ചേരുന്നില്ലെങ്കിൽ, തുടരുന്നതിന് "No, Report a Different Issue" ക്ലിക്ക് ചെയ്യുക.' },
    { id: 'full-name', selector: '[data-guide-id="full-name"]', text: 'ഘട്ടം 3. വ്യക്തിഗത വിവരങ്ങൾ. നിങ്ങളുടെ പൂർണ്ണമായ പേര് ടൈപ്പ് ചെയ്ത് എന്റർ അമർത്തുക.' },
    { id: 'phone-input', selector: '[data-guide-id="phone-input"]', text: 'ഘട്ടം 4. നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകി എന്റർ അമർത്തുക.' },
    { id: 'email-input', selector: '[data-guide-id="email-input"]', text: 'ഘട്ടം 5. നിങ്ങളുടെ ഇമെയിൽ വിലാസം നൽകി എന്റർ അമർത്തുക.' },
    { id: 'language-input', selector: '[data-guide-id="language-input"]', text: 'ഘട്ടം 6. ലിസ്റ്റിൽ നിന്ന് നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുത്ത് എന്റർ അമർത്തുക.' },
    { id: 'maps-link', selector: '[data-guide-id="maps-link"]', text: 'ഘട്ടം 7. ലൊക്കേഷൻ. നിങ്ങളുടെ കൈവശം ഗൂഗിൾ മാപ്‌സ് ലിങ്ക് ഉണ്ടെങ്കിൽ, അത് ഇവിടെ പേസ്റ്റ് ചെയ്യുക, അല്ലെങ്കിൽ ഒഴിവാക്കാൻ എന്റർ അമർത്തുക.' },
    { id: 'area-input', selector: '[data-guide-id="area-input"]', text: 'ഘട്ടം 8. നിങ്ങളുടെ പ്രദേശം അല്ലെങ്കിൽ സ്ഥലത്തിന്റെ പേര് ടൈപ്പ് ചെയ്ത് എന്റർ അമർത്തുക.' },
    { id: 'city-input', selector: '[data-guide-id="city-input"]', text: 'ഘട്ടം 9. നിങ്ങളുടെ നഗരത്തിന്റെ പേര് ടൈപ്പ് ചെയ്ത് എന്റർ അമർത്തുക.' },
    { id: 'landmark-input', selector: '[data-guide-id="landmark-input"]', text: 'ഘട്ടം 10. അടുത്തുള്ള ലാൻഡ്‌മാർക്ക് (വേണമെങ്കിൽ) നൽകി എന്റർ അമർത്തുക.' },
    { id: 'issue-type', selector: '[data-guide-id="issue-type"]', text: 'ഘട്ടം 11. പ്രശ്നത്തിന്റെ വിശദാംശങ്ങൾ. നിങ്ങൾ റിപ്പോർട്ട് ചെയ്യുന്ന പ്രശ്നത്തിന്റെ തരം തിരഞ്ഞെടുത്ത് എന്റർ അമർത്തുക.' },
    { id: 'description', selector: '[data-guide-id="description"]', text: 'ഘട്ടം 12. പ്രശ്നത്തെക്കുറിച്ച് നിങ്ങളുടെ സ്വന്തം വാക്കുകളിൽ വിവരിക്കുക. പൂർത്തിയാകുമ്പോൾ എന്റർ അമർത്തുക.' },
    { id: 'file-upload', selector: '[data-guide-id="file-upload"]', text: 'ഘട്ടം 13. പ്രശ്നത്തിന്റെ ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക (വേണമെങ്കിൽ). തിരഞ്ഞെടുത്ത ശേഷം അല്ലെങ്കിൽ ഒഴിവാക്കാൻ എന്റർ അമർത്തുക.' },
    { id: 'severity-input', selector: '[data-guide-id="severity-input"]', text: 'ഘട്ടം 14. പ്രശ്നം എത്രത്തോളം ഗൗരവകരമാണ്? അതിൽ ക്ലിക്ക് ചെയ്ത് ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക.' },
    { id: 'duration-input', selector: '[data-guide-id="duration-input"]', text: 'ഘട്ടം 15. ഈ പ്രശ്നം എത്ര കാലമായി നിലവിലുണ്ട്? കാലാവധി നൽകി എന്റർ അമർത്തുക.' },
    { id: 'volunteer-input', selector: '[data-guide-id="volunteer-input"]', text: 'ഘട്ടം 16. അടുത്തുള്ള സന്നദ്ധപ്രവർത്തകരെ സഹായിക്കാൻ അനുവദിക്കണമോ? അതെ (Yes) അല്ലെങ്കിൽ ഇല്ല (No) തിരഞ്ഞെടുക്കുക.' },
    { id: 'updates-input', selector: '[data-guide-id="updates-input"]', text: 'ഘട്ടം 17. ഈ പ്രശ്നത്തെക്കുറിച്ച് അപ്‌ഡേറ്റുകൾ വേണോ? അതെ (Yes) അല്ലെങ്കിൽ ഇല്ല (No) തിരഞ്ഞെടുക്കുക.' },
    { id: 'consent-input', selector: '[data-guide-id="consent-input"]', text: 'ഘട്ടം 18. ഏകദേശം പൂർത്തിയായി. നിങ്ങളുടെ വിവരങ്ങൾ ശരിയാണെന്ന് ഉറപ്പാക്കാൻ ബോക്സ് ചെക്ക് ചെയ്യുക.' },
    { id: 'submit-report', selector: '[data-guide-id="submit-report"]', text: 'ഘട്ടം 19. അവസാന ഘട്ടം. നിങ്ങളുടെ പരാതി അയക്കാൻ "Submit Report" ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ എന്റർ അമർത്തുക.' },
    { id: 'issue-id-display', selector: '[data-guide-id="issue-id-display"]', text: 'ഘട്ടം 20. നിങ്ങളുടെ പരാതി രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ഇതാണ് നിങ്ങളുടെ യുണീക് കോഡ്. ദയവായി ഇത് ഇപ്പോൾ കോപ്പി ചെയ്യുക.' },
    { id: 'track-link', selector: '[data-guide-id="track-link"]', text: 'ഘട്ടം 21. അവസാന ഘട്ടം. അപ്‌ഡേറ്റുകൾക്കായി എപ്പോൾ വേണമെങ്കിലും മുകളിലെ മെനുവിൽ "Track Status" ക്ലിക്ക് ചെയ്യുക. ഗൈഡ് ഇപ്പോൾ പൂർത്തിയായി.' },
];

const VoiceGuideAssistant = ({ externalStart, onExternalStarted, onOpenChatbot, selectedLanguage = 'en-IN' }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isJoinedFlow, setIsJoinedFlow] = useState(false);
    const [pointerPos, setPointerPos] = useState({ top: 0, left: 0, visible: false });

    const STEPS = useMemo(() => {
        if (selectedLanguage === 'ta-IN') return STEPS_TA;
        if (selectedLanguage === 'hi-IN') return STEPS_HI;
        if (selectedLanguage === 'te-IN') return STEPS_TE;
        if (selectedLanguage === 'ml-IN') return STEPS_ML;
        return STEPS_EN;
    }, [selectedLanguage]);

    const step = useMemo(() => STEPS[stepIndex], [STEPS, stepIndex]);
    const isLastStep = stepIndex === STEPS.length - 1;

    const advanceStep = () => {
        setStepIndex((prev) => {
            if (prev >= STEPS.length - 1) return prev;
            return prev + 1;
        });
    };

    // 🎙️ Speech Engine (Robust)
    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const langLower = selectedLanguage.toLowerCase();
        
        // Find best voice match
        let voice = voices.find(v => v.lang.toLowerCase() === langLower) || 
                    voices.find(v => v.lang.toLowerCase().startsWith(langLower.split('-')[0]));
        
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.lang = selectedLanguage;
        utterance.rate = 1.0; 
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, [selectedLanguage]);

    // 🎙️ Robust Speech Manager (Effect)
    useEffect(() => {
        if (!isRunning || isCompleted) return;
        
        let textToSpeak = step.text;
        
        // Handle Joined Flow Overrides
        if (isJoinedFlow) {
            if (step.id === 'issue-id-display') {
                textToSpeak = selectedLanguage === 'ta-IN' ? "நீங்கள் புகாரில் வெற்றிகரமாக இணைந்துள்ளீர்கள். ఇది ఒక பகிரப்பட்ட தனித்துவமான குறியீடு. మీరు దీన్ని ట్రాక్ చేయాలనుకుంటే ఇప్పుడు కాపీ చేయండి." :
                              selectedLanguage === 'hi-IN' ? "आप सफलतापूर्वक शिकायत में शामिल हो गए हैं। यह साझा विशिष्ट कोड है। यदि आप इसे ट्रैक करना चाहते हैं तो कृपया इसे अभी कॉपी करें।" :
                              selectedLanguage === 'te-IN' ? "మీరు ఫిర్యాదులో విజయవంతంగా చేరారు. ఇది భాగస్వామ్యం చేయబడిన ప్రత్యేక కోడ్. మీరు దీన్ని ట్రాక్ చేయాలనుకుంటే ఇప్పుడు కాపీ చేయండి." :
                              selectedLanguage === 'ml-IN' ? "നിങ്ങൾ പരാതിയിൽ വിജയകരമായി ചേർന്നു. ഇതൊരു ഷെയർഡ് യൂണിക് കോഡാണ്. നിങ്ങൾക്ക് ഇത് ട്രാക്ക് ചെയ്യണമെന്നുണ്ടെങ്കിൽ ഇപ്പോൾ കോപ്പി ചെയ്യുക." :
                              "You have successfully joined the complaint. This is the shared unique code. Please copy it now if you wish to track it.";
            } else if (step.id === 'track-link') {
                textToSpeak = selectedLanguage === 'ta-IN' ? "நிலையைச் சரிபார்க்க எப்போது வேண்டுமானாலும் மேலே உள்ள மெனுவில் 'Track Status' என்பதைக் கிளிக் செய்யவும். வழிகாட்டி இப்போது முடிந்தது." :
                              selectedLanguage === 'hi-IN' ? "अपडेट देखने के लिए कभी भी ऊपर के मेनू में 'Track Status' पर क्लिक करें। गाइड अब पूरा हो गया है।" :
                              selectedLanguage === 'te-IN' ? "అప్‌డేట్‌ల కోసం ఎప్పుడైనా పైన ఉన్న మెనూలో 'Track Status' క్లిక్ చేయండి. గైడ్ ఇప్పుడు పూర్తయింది." :
                              selectedLanguage === 'ml-IN' ? "അപ്‌ഡേറ്റുകൾക്കായി എപ്പോൾ വേണമെങ്കിലും മുകളിലെ മെനുവിൽ 'Track Status' ക്ലിക്ക് ചെയ്യുക. ഗൈഡ് ഇപ്പോൾ പൂർത്തിയായി." :
                              "Click 'Track Status' in the menu above anytime to check for updates. The guide is now complete.";
            }
        }

        // Small delay to ensure voices are loaded if browser is slow
        const timer = setTimeout(() => speak(textToSpeak), 50);
        console.log(`[Assistant] Speaking (${selectedLanguage}): ${step.id}`);

        return () => {
            clearTimeout(timer);
            window.speechSynthesis.cancel();
        };
    }, [isRunning, stepIndex, isCompleted, step.text, selectedLanguage, isJoinedFlow, speak, step.id]);

    // Handle Completion Message
    useEffect(() => {
        if (!isCompleted) return;
        
        const text = selectedLanguage === 'ta-IN' ? "வழிகாட்டி இப்போது முடிந்தது. மேலே உள்ள மெனுவில் இருந்து எந்த நேரத்திலும் உங்கள் புகார் நிலையை நீங்கள் கண்காணிக்கலாம்." :
                     selectedLanguage === 'hi-IN' ? "गाइड अब पूरा हो गया है। आप ऊपर के मेनू से कभी भी अपनी शिकायत की स्थिति ट्रैक कर सकते हैं।" :
                     selectedLanguage === 'te-IN' ? "గైడ్ ఇప్పుడు పూర్తయింది. మీరు ఎప్పుడైనా అగ్ర మెనూ నుండి మీ ఫిర్యాదు స్థితిని ట్రాక్ చేయవచ్చు." :
                     selectedLanguage === 'ml-IN' ? "ഗൈഡ് ഇപ്പോൾ പൂർത്തിയായി. മുകളിലെ മെനുവിൽ നിന്ന് നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും നിങ്ങളുടെ പരാതിയുടെ നില ട്രാക്ക് ചെയ്യാം." :
                     'The guide is now complete. You can track your complaint status anytime from the top menu.';
        
        const timer = setTimeout(() => speak(text), 400);
        return () => clearTimeout(timer);
    }, [isCompleted, selectedLanguage, speak]);

    // 📍 High-Performance Pointer Tracking
    useEffect(() => {
        let timer;
        if (!isRunning) {
            timer = setTimeout(() => {
                setPointerPos(prev => ({ ...prev, visible: false }));
            }, 0);
            return () => clearTimeout(timer);
        }

        let animationFrameId;
        const updatePointer = () => {
            const target = document.querySelector(step.selector);
            if (!target) {
                setPointerPos(prev => ({ ...prev, visible: false }));
                animationFrameId = requestAnimationFrame(updatePointer);
                return;
            }

            // Ensure highlight is applied
            if (!target.classList.contains('guide-highlight')) {
                document.querySelectorAll('.guide-highlight').forEach(el => el.classList.remove('guide-highlight'));
                target.classList.add('guide-highlight');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            const rect = target.getBoundingClientRect();
            setPointerPos({
                top: rect.top + window.scrollY + (rect.height / 2),
                left: rect.left + window.scrollX - 45,
                visible: true
            });

            // Focus management
            if (document.activeElement !== target && isRunning) {
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    target.focus();
                }
            }

            animationFrameId = requestAnimationFrame(updatePointer);
        };

        animationFrameId = requestAnimationFrame(updatePointer);

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.querySelectorAll('.guide-highlight').forEach(el => el.classList.remove('guide-highlight'));
        };
    }, [isRunning, stepIndex, step.selector]);

    // ⏩ Auto-skip Logic for Smart Duplicate Check
    useEffect(() => {
        if (!isRunning || step.id !== 'recommendation-title') return;

        const skipInterval = setInterval(() => {
            const recTitleExists = document.querySelector('[data-guide-id="recommendation-title"]');
            const fullNameExists = document.querySelector('[data-guide-id="full-name"]');
            
            if (!recTitleExists && fullNameExists) {
                setStepIndex((prev) => {
                    if (prev >= STEPS.length - 1) return prev;
                    if (STEPS[prev].id === 'recommendation-title') {
                        return prev + 1;
                    }
                    return prev;
                });
            }
        }, 500);

        return () => clearInterval(skipInterval);
    }, [isRunning, step.id, STEPS]);

    // Main interaction handler
    useEffect(() => {
        if (!isRunning) return;

        let stepCompleted = false;

        const completeStep = () => {
            if (stepCompleted) return; 
            stepCompleted = true;

            if (isLastStep) {
                setIsRunning(false);
                setIsCompleted(true);
                return;
            }
            advanceStep();
        };

        // 🕵️ Success Monitor
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
                    return;
                }

                // Validation checks
                if (target) {
                    const value = target.value.trim();
                    if (step.id === 'full-name' && !value) {
                        const msg = selectedLanguage === 'ta-IN' ? "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்." :
                                    selectedLanguage === 'hi-IN' ? "कृपया अपना नाम दर्ज करें।" :
                                    selectedLanguage === 'te-IN' ? "దయచేసి మీ పేరును నమోదు చేయండి." :
                                    selectedLanguage === 'ml-IN' ? "ദയവായി നിങ്ങളുടെ പേര് നൽകുക." :
                                    'Please enter your name.';
                        speak(msg);
                        return;
                    }
                    if (step.id === 'phone-input') {
                        const digits = value.replace(/\D/g, '');
                        if (digits.length < 10) {
                            const msg = selectedLanguage === 'ta-IN' ? "தொலைபேசி எண் குறைந்தது 10 இலக்கங்களைக் கொண்டிருக்க வேண்டும்." :
                                        selectedLanguage === 'hi-IN' ? "फ़ोन नंबर कम से कम 10 अंकों का होना चाहिए।" :
                                        selectedLanguage === 'te-IN' ? "ఫోన్ నంబర్ కనీసం 10 అంకెలు ఉండాలి." :
                                        selectedLanguage === 'ml-IN' ? "ഫോൺ നമ്പർ കുറഞ്ഞത് 10 അക്കങ്ങൾ ആയിരിക്കണം." :
                                        'Phone number must be at least 10 digits.';
                            speak(msg);
                            return;
                        }
                    }
                    if (step.id === 'description' && !value) {
                        const msg = selectedLanguage === 'ta-IN' ? "தயவுசெய்து ஒரு சிறிய விளக்கத்தை வழங்கவும்." :
                                    selectedLanguage === 'hi-IN' ? "कृपया एक संक्षिप्त विवरण प्रदान करें।" :
                                    selectedLanguage === 'te-IN' ? "దయచేసి చిన్న వివరణను అందించండి." :
                                    selectedLanguage === 'ml-IN' ? "ദയവായി ഒരു ചെറിയ വിവരണം നൽകുക." :
                                    'Please provide a short description.';
                        speak(msg);
                        return;
                    }
                }

                completeStep();
            }
        };

        const handleClickOrChange = (e) => {
            if (step.id === 'recommendation-title' && e.type === 'click') {
                if (e.target.closest && e.target.closest('[data-guide-id="report-new-issue"]')) {
                    completeStep();
                    return;
                }
            }

            const target = document.querySelector(step.selector);
            if (!target) return;

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
    }, [isRunning, step, isLastStep, selectedLanguage, speak]);

    useEffect(() => {
        const handleStop = () => {
            window.speechSynthesis.cancel();
            setIsRunning(false);
            setIsCompleted(true);
        };
        
        const handleJoinedSuccess = () => {
            setIsJoinedFlow(true);
            setStepIndex(19); // 'issue-id-display'
        };

        window.addEventListener('civicfix:stop-guide', handleStop);
        window.addEventListener('civicfix:guide-jump-to-joined-success', handleJoinedSuccess);

        return () => {
            window.removeEventListener('civicfix:stop-guide', handleStop);
            window.removeEventListener('civicfix:guide-jump-to-joined-success', handleJoinedSuccess);
            window.speechSynthesis.cancel();
        };
    }, []);

    const startGuide = () => {
        setStepIndex(0);
        setIsCompleted(false);
        setIsJoinedFlow(false);
        setIsRunning(true);
    };

    useEffect(() => {
        if (externalStart) {
            startGuide();
            if (onExternalStarted) onExternalStarted();
        }
    }, [externalStart, onExternalStarted]);

    const stopGuide = () => {
        setIsRunning(false);
        window.speechSynthesis.cancel();
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
                    <button type="button" className="btn btn-primary guide-btn" onClick={startGuide}>
                        🎙️ Start Guide
                    </button>
                    <button type="button" className="btn guide-btn" onClick={stopGuide} disabled={!isRunning}>
                        ⏹ Stop
                    </button>
                    <button type="button" className="btn guide-btn-chat" onClick={() => onOpenChatbot && onOpenChatbot()}>
                        🤖 Chat Bot
                    </button>
                </div>
            </div>
        </>
    );
};

export default VoiceGuideAssistant;
