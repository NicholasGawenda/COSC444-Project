    var surveyComplete = false;
    var jsPsych1 = initJsPsych({

        display_element: document.getElementsByClassName('left')[0],
        on_finish: function() {
        surveyComplete = true;
        jsPsych1.data.displayData();
    }});
    var jsPsych2 = initJsPsych({
        display_element: document.getElementsByClassName('right')[0],
        on_finish: function() {
        jsPsych2.data.displayData();
    }});
    var lefttimeline = [];
    var righttimeline = [];
    var welcome = {
        type:jsPsychHtmlKeyboardResponse,
        stimulus: '<h1>Welcome to the experiment</h1><p>Press any key to begin.</p>'
    }
    var rightToLeftCheck = {
        type:jsPsychHtmlKeyboardResponse,
        stimulus: '<h2>Some Info about you first</h2><p>Before we begin are you proficient in any languages that are read right-to-left (Arabic, Farsi, Hindi, etc.)?</p><p>Press y or n to continue.</p>',
        choices: ['y', 'n'],
    }

    var question1 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #1", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    }
    var question2 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #2", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    }
    var question3 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #3", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    }
    var question4 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #4", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    }
     var question5 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #5", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    }
    var question6 = {
            type: jsPsychSurveyText,
            questions: [
                {prompt: "question #6", placeholder: 'Type answer here', required: true},
            ],
            data: {task: 'survey_question'}
        }
     var question7 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #7", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    };
     var question8 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #8", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    };
     var question9 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #9", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    };
     var question10 = {
        type: jsPsychSurveyText,
        questions: [
            {prompt: "question #10", placeholder: 'Type answer here', required: true},
        ],
        data: {task: 'survey_question'}
    };
    var question_bank = {
        timeline: [question1, question2, question3, question4, question5, question6, question7, question8, question9, question10],
    };
    var secondarytask ={
        type:jsPsychHtmlKeyboardResponse,
        stimulus: `
                <div style="text-align: center;">
                    <h2>Secondary task</h2>
                    <p> while answering the questions, Numbers will appear on this screen. </p>
                    <p>Pay attention to them - you'll be asked to recall them occasionally</p>
                </div>
                    `,
                    choices: "NO_KEYS",
                trial_duration: 10000 // 10 seconds
    };
    var visual_stimulus = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function() {
            var num = Math.floor(Math.random()*9)+1;
            return  `<div style="font-size:96px;font-weight:bold;text-align:center;padding:100px;">${num}</div>`;
        },
        choices:"NO_KEYS",
        trial_duration: 2000, // 2 seconds
        data:{
            task: 'visual_data',
            stimulus: function(){
                return Math.floor(Math.random() * 9)+1;
            }
        },
        on_start: function(trial){
            if (surveyComplete){
                jsPsych2.abortExperiment();
                return;
            }
            trial.data.stimulus_number = Math.floor(Math.random() * 9) + 1 ;
            trial.stimulus = `<div style="font-size:96px;font-weight:bold;text-align:center;padding:100px;">${trial.data.stimulus_number}</div>`;
        }
    };
    var stimulus_CD={
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div  style="height:300px;"></div>',
        choices:"NO_KEYS",
        trial_duration: function(){
            return Math.random() * 1000 + 1500;
        }
    };

    var trial_prompt = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "What was the last number you saw?",
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    data: {task: 'catch_trial'},
    on_start: function(){
            if (surveyComplete){
                jsPsych2.abortExperiment();
                return;
            }},
    on_finish: function(data) {
        var lastStimulus = jsPsych2.data.get().filter({task: 'visual_monitoring'}).last(1).values()[0];
        if (lastStimulus) {
            data.correct_answer = lastStimulus.stimulus_number;
            data.correct = (data.response == (data.correct_answer - 1)); // Button responses are 0-indexed
        }
    }
};

    var numbergen = {
        timeline:[visual_stimulus, stimulus_CD],
        repetitions: 100
    }
    var number_prompt = {
        timeline:[numbergen, trial_prompt],
        repetitions:100
    }

    lefttimeline.push(welcome);
    lefttimeline.push(rightToLeftCheck);
    lefttimeline.push(question_bank);
    jsPsych1.run(lefttimeline);
    righttimeline.push(secondarytask);
    righttimeline.push(number_prompt);
    jsPsych2.run(righttimeline);
    