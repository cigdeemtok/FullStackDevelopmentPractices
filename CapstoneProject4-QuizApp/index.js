import express from "express";
import bodyParser from "body-parser";
import axios, { all } from "axios";
import he from "he";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const baseURL = " https://opentdb.com/api.php";
// using this opentdb public API to get quiz questions
// any type -> https://opentdb.com/api.php?amount=10
// all types -> https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple

const selectionData = {};

app.get("/", (req,res)=>{
    res.render("index.ejs");
});
//get questions based on the form data user select
app.post("/quiz", async (req,res)=>{
    selectionData.numberOfQuestions = req.body.numberOfQuestions;
    selectionData.categoryType = req.body.categoryType;
    selectionData.difficultyType = req.body.difficultyType;
    selectionData.answerType = req.body.answerType;

    let fullURL = baseURL + `?amount=${selectionData.numberOfQuestions}`;

    if(selectionData.categoryType !== ""){
        fullURL += `&category=${selectionData.categoryType}`;
    }
    if(selectionData.difficultyType !== ""){
        fullURL += `&difficulty=${selectionData.difficultyType}`;
    }
    if(selectionData.answerType !==""){
        fullURL += `&type=${selectionData.answerType}`;
    }

    try {
        const result = await axios.get(fullURL);

        //error handling according to API doc 
        // 0 - success / 1- no results / 2 - invalid parameter / 3 - Token Not found
        // 4 - Token Empty / 5 - Rate limit
        const respCode =  result.data.response_code;
        if(respCode !== 0){
            if(respCode === 1){
                throw new Error("No Results! API does not have enough questions for your query.");
            }
            else if(respCode === 2){
                throw new Error("Invalid parameter. Fields that you selected are not valid.");
            }
            else if(respCode === 3){
                throw new Error("Token not found.");
            }
            else if(respCode === 4){
                throw new Error("Token empty");
            }
        }

        const allQuestions = [];
        

        result.data.results.forEach(q =>{
            //clean the data from API with html-entities library
            q.question = he.decode(q.question);
            
            //create an all answers array
            const answers = [...q.incorrect_answers,q.correct_answer];

            //get all questions to send
            allQuestions.push({
                category : q.category,
                difficulty: q.difficulty,
                question: q.question,
                correct_answer: q.correct_answer,
                all_answers: answers
            });


        });
        res.render("quiz.ejs", {questions : allQuestions});
    } catch (error) {
        console.error("Error occured when trying to get trivia. Error message:",error.message);
        res.render("quiz.ejs",{error : error.message});
    }
});
//handle result with the data from frontend
app.post("/submit-quiz",(req,res)=>{
    const {userAnswers, questions} = req.body;
    let score = 0;
    const questionLen = questions.length;

    questions.forEach((q,index)=>{
        const userAnswer = userAnswers[index];

        if(userAnswer && userAnswer === q.correct_answer){
            score++;
        }
    });

    let successPercentage = 0; 
    if(questionLen > 0){
        successPercentage = (score/questionLen) * 100;
    }

    res.json({
        success : true,
        score: score,
        questionNumber: questions.length,
        percentage: successPercentage.toFixed(2)
    });
});
//calculate result and render result page with scores
app.get("/results", (req,res)=>{
    const score = req.query.score;
    const questionLen = req.query.questionNumber;
    const percentage = req.query.percentage;

    if(score !== undefined && questionLen !== undefined && percentage !== undefined){
        res.render("result.ejs",{
            score: score,
            questionNum: questionLen,
            percentage: percentage
        });
    }else{
        res.redirect("/");
    }
});

app.listen(PORT, ()=>{
    console.log("Server running on port",PORT);
});