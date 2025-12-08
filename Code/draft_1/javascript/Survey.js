const MULTIPLE_CHOICE = "Multiple Choice";
const SHORT_ANSWER = "Short Answer";

// state variables
let currentQuestionIndex = 0;
let myQuestions = [];
let userAnswers = []; // Store what the user typed/clicked

// question object structure
class Question {
    constructor(topic, title, text, type, options = {}) {
        this.qTopic = topic;
        this.qTitle = title;
        this.qText = text;
        this.qType = type;
        this.qOptions = options; // object like { "Left": "Left", "Right": "Right" }
    }
}

/*
    Format in json file:
[
    {
    "qTopic": "TEMPLATE",
    "qTitle": "TEMPLATE",
    "qText": "TEMPLATE",
    "qType": "TEMPLATE",
    "qOptions": {"TEMPLATE": "TEMPLATE"}
    }
]

*/

// Rendering
function RenderQuestion() {
    // check if the survey is completed already.
    if (currentQuestionIndex >= myQuestions.length) {
        document.getElementById("survey").innerHTML = "<h2>Survey Complete!</h2><p>Check console for answers.</p>";
        console.log("Final Answers:", userAnswers);
        return;
    }

    let question = myQuestions[currentQuestionIndex];

    // Update static text based on current question
    document.getElementById("topic").innerText = question.qTopic;
    document.getElementById("question_title").innerText = question.qTitle;
    document.getElementById("question_text").innerText = question.qText;

    // Handle Input Areas
    // The textarea:
    let uTextInput = document.getElementById("user_text");
    // The div for radio buttons:
    let uOptions = document.getElementById("options");

    // clear previous inputs
    uTextInput.value = "";
    uOptions.innerHTML = "";

    if (question.qType === SHORT_ANSWER) {
        uTextInput.hidden = false;
        uOptions.hidden = true;

    } else if (question.qType === MULTIPLE_CHOICE) {
        uTextInput.hidden = true;
        uOptions.hidden = false;

        // Dynamically create "Radio Buttons"
        for (let key in question.qOptions) {
            let value = question.qOptions[key];

            // <input type="radio">
            let radioBtn = document.createElement("input");
            radioBtn.type = "radio";
            radioBtn.name = "current_choice";
            radioBtn.value = key;
            radioBtn.id = "opt_" + key;

            // <label>
            let label = document.createElement("label");
            label.htmlFor = radioBtn.id;
            label.innerText = value;

            // <br>
            let br = document.createElement("br");

            // Add to DOM
            uOptions.appendChild(radioBtn);
            uOptions.appendChild(label);
            uOptions.appendChild(br);
        }
    }
}

// User Interactions
function HandleNextButtonClick() {
    let question = myQuestions[currentQuestionIndex];
    let answer = null;

    // record answer based on type.
    if (question.qType === SHORT_ANSWER) {
        let uTextInput = document.getElementById("user_text");
        answer = uTextInput.value;

        if (answer.trim() === "") {
            alert("Please type an answer.");
            return; // don't continue yet.
        }

    } else if (question.qType === MULTIPLE_CHOICE) {
        // which radio button is selected?
        let selectedOption = document.querySelector('input[name="current_choice"]:checked');

        if (!selectedOption) {
            alert("Please select an option.");
            return;
        }
        answer = selectedOption.value;
    }

    // store answer
    userAnswers.push({
        question: question.qTitle,
        answer: answer
    });

    // next question
    currentQuestionIndex++;
    RenderQuestion();
}

// fetches data from the file 'questions.json'
async function LoadQuestions() {
    try {
        // ask browser to go get the file (WONT WORK UNLESS USING WEBSTORM OR SOME FORM OF LOCAL SERVER)
        const response = await fetch("questions.json");

        // check if file was found; else write an error.
        if (!response.ok) {
            throw new Error(`File not found, are you running a local server?: ${response.status}`);
        }

        // convert into javascript object
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Could not load questions:", error);
        return []; // Return empty array if it fails
    }
}

// async so that the questions file can load
window.onload = async function () {
    console.log("Loading questions...");

    // oh romeo, i await the arrival of thee beloved questions
    myQuestions = await LoadQuestions();

    // start if we actually have the questions
    if (myQuestions.length > 0) {
        let sButton = document.getElementById("button");
        if (sButton) sButton.onclick = HandleNextButtonClick;

        RenderQuestion();
        console.log("Survey loaded.");
    } else {
        // else poop
        document.getElementById("survey").innerHTML = "Error loading questions.";
    }
};