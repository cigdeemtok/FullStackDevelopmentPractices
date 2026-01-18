$(document).ready(() => {
  //check if questions exist
  if (typeof allQuestions === "undefined" || allQuestions.length === 0) {
    return;
  }

  const quizQuestions = allQuestions;
  let currentIndex = 0;

  const userAnswers = {};
  const quesTionNumber = quizQuestions.length;

  //show questions
  function renderQuestion() {
    const currentQuestion = quizQuestions[currentIndex];

    //put question info to html
    $("#question-number").text(
      `Question ${currentIndex + 1}/${quesTionNumber}`
    );
    $("#question-info").text(
      `Category: ${currentQuestion.category} | Difficulty: ${currentQuestion.difficulty}`
    );
    $("#question-text").text(currentQuestion.question);

    const answers = currentQuestion.all_answers;
    //shuffle the answers array with Fisher-Yates algorithm
    answers.sort(() => Math.random() - 0.5);

    const answered = userAnswers[currentIndex] !== undefined;
    const correctAnswer = currentQuestion.correct_answer;

    let answerButtonHtml = "";

    answers.forEach((answer) => {
      //check if answer selected
      const isSelected = userAnswers[currentIndex] === answer;
      //check if it is correct answer to manipulate button colors
      const isCorrectAnswer = answer === correctAnswer;

      let buttonClass = "btn-outline-dark";
      let isDisabled = "";

      //if answered disable and lock buttons and change colors
      if (answered) {
        isDisabled = "disabled";

        if (isCorrectAnswer) {
          //if correct answer make button green
          buttonClass = "btn-success";
        } else if (isSelected) {
          //if wrong answer make button red
          buttonClass = "btn-danger";
        } else {
          //make other buttons gray
          buttonClass = "btn-outline-dark";
        }
      } else {
        //if not answered manipulate button color
        buttonClass = isSelected ? "btn-primary" : "btn-outline-dark";
      }

      answerButtonHtml += `
                <div class="col-sm-6">
                    <button
                        type="button"
                        class="btn btn-answer ${buttonClass} w-100 py-3 rounded-3 shadow-sm"
                        data-answer="${answer}"
                        ${isDisabled}
                    >
                        ${answer}
                    </button>
                </div>
            `;
    });

    $("#answer-buttons-container").html(
      `<div class="row mb-3 g-3">${answerButtonHtml}</div>`
    );

    updateButtons();
  }

  //update buttons based on next or prev clicked
  function updateButtons() {
    const nextBtn = $(".btn-next");
    const prevBtn = $(".btn-prev");

    const isAnswered = userAnswers[currentIndex] !== undefined;

    prevBtn.prop("disabled", currentIndex === 0);

    if (currentIndex === quesTionNumber - 1) {
      nextBtn.text("Finish Quiz");
      nextBtn.removeClass("btn-success").addClass("btn-danger");
    } else {
      nextBtn.text("Next >");
      nextBtn.removeClass("btn-danger").addClass("btn-success");

      nextBtn.prop("disabled", !isAnswered);
    }
  }

  //handle button clicks

  //selected answer button clicks
  //make selection permanent
  $("#answer-buttons-container")
    .off("click", ".btn-answer")
    .on("click", ".btn-answer", function () {
      if (userAnswers[currentIndex] !== undefined) {
        return;
      }
      //get the answer
      const selectedAnswer = $(this).data("answer");
      userAnswers[currentIndex] = selectedAnswer;

      const correctAnswer = quizQuestions[currentIndex].correct_answer;

      $(".btn-answer").prop("disabled", true);

      $(".btn-answer").each(function () {
        const answerText = $(this).data("answer");
        $(this).removeClass(
          "btn-outline-dark btn-primary btn-danger btn-success"
        );

        if (answerText === correctAnswer) {
          $(this).addClass("btn-success");
        } else if (answerText === selectedAnswer) {
          $(this).addClass("btn-danger");
        } else {
          $(this).addClass("btn-outline-dark");
        }
      });

      updateButtons();
    });

  //handle next button clicks
  $(".btn-next").on("click", function () {
    if (currentIndex === quesTionNumber - 1) {
      submitQuiz();
    } else {
      currentIndex++;
      renderQuestion();
    }
  });

  //handle prev question clicks
  $(".btn-prev").on("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  //send results to backend
  function submitQuiz() {
    if (Object.keys(userAnswers).length < quesTionNumber) {
      alert("Please make sure you answered all of the questions!");
      return;
    }

    fetch("/submit-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAnswers: userAnswers,
        questions: quizQuestions,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = `/results?score=${data.score}&questionNumber=${data.questionNumber}&percentage=${data.percentage}`;
        } else {
          alert("An error occured when calculating score!");
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
        alert("Error occured when trying to connect to the server.");
      });
  }

  renderQuestion();
});
