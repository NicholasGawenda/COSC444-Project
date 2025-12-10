const MULTIPLE_CHOICE = "Multiple Choice";
const SHORT_ANSWER = "Short Answer";
const VIDEO_EMBED = "Video";
const EMAIL = "xresearcher@emich.edu";
const DELAY_SCALE = 15000;
const DELAY_OFFSET = 8000;

// state variables
let currentQuestionIndex = 0;
let myQuestions = [];
let userAnswers = []; // Store what the user typed/clicked
let reactionTimes = [];
// note that the button used to be blue but now its less blue by about 100%
let blueBtnTimer = null;
let blueBtnStartTime = 0;
let isTaskRunning = false;// determined by the task parameter of questions
let questionStartTime = 0;
let surveyStartTime = 0;

// question object structure, can probably just remove now.
class Question {
    constructor(topic, title, text, type, options = {}, task = false) {
        this.qTopic = topic;
        this.qTitle = title;
        this.qText = text;
        this.qType = type;
        this.qOptions = options; // object like { "Left": "Left", "Right": "Right" }
        this.qTask = task;
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
    "qOptions": {"TEMPLATE": "TEMPLATE"},
    "task": TEMPLATE
    }
]

*/

function SummonTheBlueDemon() {
    let stats = document.createElement("div");
    stats.id = "stats_box";
    document.body.appendChild(stats);

    let btn = document.createElement("img");
    btn.id = "blue_task_button";
    btn.src = "button.png";
    btn.alt = "Click Target";
    btn.hidden = true;

    btn.onmousedown = function (e) {
        e.preventDefault();
    };

    btn.onclick = function () {
        HandleBlueTaskClick();
    };

    document.body.appendChild(btn);
}

function ScheduleBlueButton() {
    if (!isTaskRunning) return;

    let randomDelay = Math.random() * DELAY_SCALE + DELAY_OFFSET;

    if (blueBtnTimer) clearTimeout(blueBtnTimer);

    blueBtnTimer = setTimeout(() => {
        let btn = document.getElementById("blue_task_button");
        if (btn && isTaskRunning) {
            // padding
            let maxX = window.innerWidth - 150;
            let maxY = window.innerHeight - 150;
            // random pos
            let randomX = Math.random() * maxX;
            let randomY = Math.random() * maxY;

            btn.style.left = randomX + "px";
            btn.style.top = randomY + "px";

            btn.hidden = false;
            blueBtnStartTime = performance.now();
        }
    }, randomDelay);
}

function HandleBlueTaskClick() {
    let btn = document.getElementById("blue_task_button");
    let stats = document.getElementById("stats_box");

    let endTime = performance.now();
    let delay = Math.round(endTime - blueBtnStartTime);

    btn.hidden = true;

    reactionTimes.push({
        timestamp: new Date().toISOString(), reaction_ms: delay, during_question_index: currentQuestionIndex
    });

    let totalReactionTime = 0;
    for (let i = 0; i < reactionTimes.length; i++) {
        totalReactionTime += reactionTimes[i].reaction_ms;
    }
    let avgReactionTime = Math.round(totalReactionTime / reactionTimes.length);

    stats.innerText = "Last: " + delay + "ms\n" + "Avg: " + avgReactionTime + "ms (" + reactionTimes.length + ")\n" + "Q:" + (currentQuestionIndex + 1) + "/" + myQuestions.length;
    stats.style.color = delay > 3000 ? "red" : "#0f0";

    let uTextInput = document.getElementById("user_text");
    if (uTextInput && !uTextInput.hidden) {
        uTextInput.focus();
    }

    ScheduleBlueButton();
}

function StopTheMadness() {
    isTaskRunning = false;
    clearTimeout(blueBtnTimer);
    let btn = document.getElementById("blue_task_button");
    if (btn) btn.hidden = true;
    let stats = document.getElementById("stats_box");
    if (stats) stats.innerText = "Task Paused";
}

// Rendering
function RenderQuestion() {
    // check if the survey is completed already.
    if (currentQuestionIndex >= myQuestions.length) {
        StopTheMadness();
        document.getElementById("stats_box").innerText = "Survey complete";
        document.getElementById("button").hidden = true;
        document.getElementById("options").hidden = true;
        document.getElementById("user_text").hidden = true;
        document.getElementById("question_number").hidden = true;

        let vidContainer = document.getElementById("video_container");
        if (vidContainer) vidContainer.hidden = true;

        document.getElementById("survey").innerHTML = "<h2>Survey Complete!</h2>";
        let extraText = document.createElement("p");
        extraText.innerHTML = "Please send answers to " + EMAIL;
        document.getElementById("survey").appendChild(extraText);

        console.log("Final Answers:", userAnswers);
        DownloadAnswers();
        return;
    }


    let question = myQuestions[currentQuestionIndex];

    if (question.qTask === true) {
        if (!isTaskRunning) {
            isTaskRunning = true;
            document.getElementById("stats_box").innerText = "Task Active";
            ScheduleBlueButton();
        }
    } else {
        StopTheMadness();
    }

// Update static text based on current question
    document.getElementById("topic").innerText = "Topic: " + question.qTopic;
    document.getElementById("question_title").innerText = question.qTitle;

    if (question.qType === VIDEO_EMBED) {
        document.getElementById("question_text").innerText = "Please watch the video below.";
    } else {
        document.getElementById("question_text").innerText = question.qText;
    }

    document.getElementById("question_number").innerText = ("Question " + (currentQuestionIndex + 1) + "/" + myQuestions.length);
    document.getElementById("question_number").hidden = false;
    // grab
// The textarea
    let uTextInput = document.getElementById("user_text");
// The div for radio buttons
    let uOptions = document.getElementById("options");
// The video container
    let uVideo = document.getElementById("video_container");
    if (!uVideo) {
        uVideo = document.createElement("div");
        uVideo.id = "video_container";
        document.getElementById("survey").insertBefore(uVideo, uOptions);
    }

// clear previous inputs
    uTextInput.value = "";
    uOptions.innerHTML = "";
    uVideo.innerHTML = "";

    if (question.qType === SHORT_ANSWER) {
        uTextInput.hidden = false;
        uOptions.hidden = true;
        uVideo.hidden = true;
        setTimeout(() => uTextInput.focus(), 100);

    } else if (question.qType === MULTIPLE_CHOICE) {
        uTextInput.hidden = true;
        uOptions.hidden = false;
        uVideo.hidden = true;

        // Dynamically create "Radio Buttons"
        for (let key in question.qOptions) {
            let value = question.qOptions[key];

            let row = document.createElement("div");
            row.className = "option-row";

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
            row.appendChild(radioBtn);
            row.appendChild(label);
            uOptions.appendChild(row);
        }

    } else if (question.qType === VIDEO_EMBED) {
        uTextInput.hidden = true;
        uOptions.hidden = true;
        uVideo.hidden = false;

        let iframe = document.createElement("iframe");
        iframe.width = "560";
        iframe.height = "315";
        iframe.src = "https://www.youtube.com/embed/" + question.qText;
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        uVideo.appendChild(iframe);
    }

    questionStartTime = performance.now();
}

// User Interactions
function HandleNextButtonClick() {
    let question = myQuestions[currentQuestionIndex];
    let answer = null;
    let duration = Math.round(performance.now() - questionStartTime);

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

    } else if (question.qType === VIDEO_EMBED) {
        answer = "Watched Video";
    }

    // store answer
    userAnswers.push({
        question: question.qTitle, answer: answer, duration_ms: duration
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

function DownloadAnswers() {
    console.log("prepping answers for download...");

    const studyData = {
        survey_answers: userAnswers,
        extraneous_load_metrics: reactionTimes,
        total_survey_time_ms: Math.round(performance.now() - surveyStartTime)
    };

    const textContent = JSON.stringify(studyData, null, 2);
    const blob = new Blob([textContent], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "answers.json"; // filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        // https://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
        // Directly copied because deprications were driving me insane.
        document.getElementById("user_text")
            .addEventListener("keyup", function (event) {
                event.preventDefault();
                if (event.keyCode === 13) {
                    document.getElementById("button").click();
                }
            });
        SummonTheBlueDemon();

        surveyStartTime = performance.now();
        RenderQuestion();
        console.log("Survey loaded.");
    } else {
        // else poop
        document.getElementById("survey").innerHTML = "Error loading questions.";
    }
};