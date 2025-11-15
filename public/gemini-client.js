// ⚠️ WARNING: This exposes your API key in the browser!
// For production, use a backend service instead.

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// 🔑 Replace with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyAem101c5ihsizn3o50BHpdLK35lCtjEZQ";

//------------------------------
// DROPDOWN DATA & REFERENCES
//------------------------------
const classList = ["1","2","3","4","5","6","7","8","9","10"];
const subjectList = [
    "Malayalam","English","Hindi","Arabic","Sanskrit",
    "Mathematics","Science","Social Science","ICT",
    "Health & Physical Education","Art Education",
    "General Knowledge","Moral Science","Computer Science"
];

const classSelect = document.getElementById("class-select");
const subjectSelect = document.getElementById("subject-select");
const topicSelect = document.getElementById("topic-select");
const queryInput = document.getElementById("query-input");
const contentOutput = document.getElementById("content-output");

//------------------------------
// LOAD CLASS DROPDOWN
//------------------------------
classSelect.innerHTML = '<option value="">Select Class...</option>';
classList.forEach(c => {
    classSelect.innerHTML += `<option value="${c}">Class ${c}</option>`;
});

//------------------------------
// LOAD SUBJECTS (on Class change)
//------------------------------
classSelect.addEventListener("change", () => {
    subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
    subjectList.forEach(sub => {
        subjectSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
    topicSelect.innerHTML = '<option value="">Select Topic...</option>';
});

//------------------------------
// LOAD TOPICS (on Subject change)
//------------------------------
subjectSelect.addEventListener("change", () => {
    let s = subjectSelect.value;
    topicSelect.innerHTML = '<option value="">Select Topic...</option>';

    const fixedTopicList = [];
    
    for (let i = 1; i <= 15; i++) {
        let topicName;
        
        if (s === "Hindi") {
            topicName = `पाठ ${i}`;
        } else if (s === "Arabic") {
            topicName = `الدرس ${i}`;
        } else if (s === "Sanskrit") {
            topicName = `पाठः ${i}`;
        } else {
            topicName = `Chapter ${i}`;
        }
        fixedTopicList.push(topicName);
    }
    
    fixedTopicList.forEach(t => {
        topicSelect.innerHTML += `<option value="${t} in ${s}">${t}</option>`;
    });
});

//------------------------------
// TOGGLE BUTTON GROUPS
//------------------------------
function enablePills(containerId) {
    const container = document.getElementById(containerId);
    const btns = container.querySelectorAll(".pill-btn");

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => b.classList.remove("pill-active"));
            btn.classList.add("pill-active");
        });
    });
}

enablePills("resource-type");
enablePills("medium-type");

//-----------------------------------------------------------------------------------------
// 🚀 GEMINI API INTEGRATION (Direct Frontend Call)
//-----------------------------------------------------------------------------------------
document.getElementById("generate-btn").addEventListener("click", generateContent);

async function generateContent() {
    contentOutput.innerHTML = ''; 

    const resBtn = document.querySelector("#resource-type .pill-active");
    const medBtn = document.querySelector("#medium-type .pill-active");

    // 1. GATHER AND VALIDATE INPUTS
    const resourceType = resBtn ? resBtn.dataset.type : null;
    const medium = medBtn ? medBtn.dataset.med : null;
    const selectedClass = classSelect.value;
    const selectedSubject = subjectSelect.value;
    const selectedTopic = topicSelect.value;
    const userQuery = queryInput.value.trim();
    
    if (!resourceType || !medium || !selectedClass || !selectedSubject || !selectedTopic || !userQuery) {
        contentOutput.innerHTML = '<p class="text-danger">🛑 Please ensure all fields and pills are selected, and a query is entered.</p>';
        return;
    }

    // 2. DISPLAY LOADING STATE
    contentOutput.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-sync-alt fa-spin"></i> Generating ${resourceType} for ${selectedSubject}... Please wait.
        </div>`;

    // 3. CALL GEMINI API DIRECTLY
    try {
    // Initialize Gemini AI using the API KEY variable (not plain text)
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create the prompt
    const fullPrompt = `You are an expert educational content generator named Vidyaayaanam. Create a ${resourceType} for Class ${selectedClass}, Subject ${selectedSubject}, Topic ${selectedTopic}. The content should be in ${medium} language. Format the output in a **minimalist, modern, and easy-to-read style**. Use clear headings (using ## and ###), bullet points, and short, professional paragraphs. Avoid overly decorative or conversational intros/outros. User Request/Query: "${userQuery}".`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

        // 4. DISPLAY SUCCESS WITH COPY BUTTON
        if (text) {
            // Convert markdown-style formatting to HTML for better display
            const formattedContent = text
                .replace(/## (.*)/g, '<h5 class="mt-3 mb-2 text-primary">$1</h5>')
                .replace(/### (.*)/g, '<h6 class="mt-2 mb-2">$1</h6>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');

            contentOutput.innerHTML = `
                <button class="btn btn-secondary btn-sm mb-3" onclick="copyContent()">
                    <i class="fas fa-copy me-1"></i> Copy to Clipboard
                </button>
                <div id="text-to-copy" style="white-space: pre-wrap; font-size: 0.95rem;">
                    ${formattedContent}
                </div>`;
        } else {
            contentOutput.innerHTML = `<p class="text-danger">🚫 No content was generated. Please try again.</p>`;
        }

    } catch (error) {
        // 5. DISPLAY ERROR
        console.error("Gemini API Error:", error);
        contentOutput.innerHTML = `<p class="text-danger">❌ Error: ${error.message || 'Failed to generate content. Please check your API key and try again.'}</p>`;
    }
}

// 6. COPY TO CLIPBOARD FUNCTION
window.copyContent = async function() {
    try {
        const textToCopy = document.getElementById('text-to-copy').innerText;
        await navigator.clipboard.writeText(textToCopy);
        alert('Content copied successfully!');
    } catch (err) {
        console.error('Failed to copy text:', err);
        alert('Failed to copy. Please manually select and copy the text.');
    }
}
