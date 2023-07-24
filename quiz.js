// Global Variables
var questions = []; 
var currentQuestionIndex = 0; 
var score = 0; 
var timerInterval; 


function setSelectedCategory(radioBTN) 
{
    selectedCategory = radioBTN;
    console.log("categoryValue:",selectedCategory.value);
  }

function setSelectedLevel(radioBTN) 
{
    selectedDifficulty = radioBTN;
    console.log("difficulty:",selectedDifficulty.value);
}
// Start the quiz
function startQuiz() 
{
    document.getElementById("registration-form").style.display = "none"; 
    document.getElementById("quiz-container").style.display = "block"; 
    loadQuestion();
     
}

function loadQuestion() 
{
  var questionElement = document.getElementById("questionID");
  console.log(questionElement);
  
  var optionsElements = document.getElementsByName("options");
  console.log(optionsElements);

  for (var i = 0; i < optionsElements.length; i++) 
  {
    optionsElements[i].nextElementSibling.classList.remove("selected-correct", "selected-incorrect", "correct"); // Remove CSS classes
    optionsElements[i].disabled = false; 
    optionsElements[i].checked = false; 
  }

  if (currentQuestionIndex < questions.length) 
  {
    var currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    for (var i = 0; i < optionsElements.length; i++) 
    {
      optionsElements[i].value = currentQuestion.options[i];
      optionsElements[i].nextElementSibling.textContent = currentQuestion.options[i];
      optionsElements[i].checked = false;
    }

    startTimer(); 
  } 
  else 
  {
    endQuiz(); 
  }
}



function validateConfig(numofques, level, questionCategory, email, userName) {
    var errorBlock = document.getElementById("error-block");
    errorBlock.textContent = ""; 
    console.log("error message is", errorBlock);
    console.log("number",numofques);
    if (numofques==null || !numofques || numofques.value <= 0 || numofques.value<5) 
    {
      errorBlock.textContent = "Invalid number of questions.";
      return false; 
    }
  
    if (level == null || !level ) 
    {
      errorBlock.textContent = "Invalid level.";
      return false; 
    }
  
    if (questionCategory == null || !questionCategory) 
    {
      errorBlock.textContent = "Invalid question category.";
      return false; 
    }
    
    if(userName=== "")
    {
      errorBlock.textContent = "Invalid user name.";
      return false; 
    }

    if(email=== "")
    {
      errorBlock.textContent = "Invalid email.";
      return false; 
    }


    return true; 
  }
  


function startTimer() {
  var timeRemaining = 20; 
  var timerElement = document.getElementById("timer");
  //console.log("timer: ", timerElement);
  timerElement.textContent = "Time Remaining: " + timeRemaining;

  timerInterval = setInterval(function() {
    timeRemaining--;
    timerElement.textContent = "Time Remaining: " + timeRemaining;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleAnswerSubmission(null); 
    }
  }, 1000);
}

var selectedANS = null;
function handleAnswerSubmission(selectedOption) 
{
  clearInterval(timerInterval); 

  var currentQuestion = questions[currentQuestionIndex];
  console.log("currentQuestion ", currentQuestion);
  var optionsElements = document.getElementsByName("options");

  for (var i = 0; i < optionsElements.length; i++) 
  {
    if (optionsElements[i].value === selectedOption) 
    {
      if (selectedOption === currentQuestion.correctOption) 
      {
        //console.log(selectedOption);
        //console.log(currentQuestion.correctOption);
        optionsElements[i].nextElementSibling.classList.add("selected-correct"); 
      } 
      else 
      {
        optionsElements[i].nextElementSibling.classList.add("selected-incorrect"); 

        // Find and highlight the correct option with green
        for (var j = 0; j < optionsElements.length; j++) {
          if (optionsElements[j].value === currentQuestion.correctOption) 
          {
            optionsElements[j].nextElementSibling.classList.add("correct"); 
            break;
          }
        }
      }
    }
    optionsElements[i].disabled = true; 
  }
  if (selectedOption === currentQuestion.correctOption) 
  {
    console.log("score", score);
    score++; 
    console.log("score", score);
  }

  setTimeout(function() {
    currentQuestionIndex++; 
    loadQuestion(); 
  }, 1000); 
}


function endQuiz()
{
  console.log("Final Score: " + score);
  var submitAnswerButton = document.getElementById("submit-answer");
  submitAnswerButton.disabled = true;
  var finalScoreElement = document.getElementById("final-score");
  console.log("final s element", finalScoreElement);
  finalScoreElement.textContent = "Your final score: " + score;
  finalScoreElement.style.display = "block";
}


function validate(response) 
{
  if (response && response.results && response.results.length > 0) 
  {
    questions = response.results.map(function(question) 
    {
      var options = question.incorrect_answers.slice(); 
      options.push(question.correct_answer); 
      options = shuffle(options); 

      return {
        question: question.question,
        options: options,
        correctOption: question.correct_answer,
      };
    });

    startQuiz(); 
  } 
  
  else 
  {
    console.log("Invalid API response");
  }
}


function shuffle(array) 
{
  var currentIndex = array.length;
  console.log("length currentIndex", currentIndex);
  var temporaryValue;
  var randomIndex;

  while (currentIndex !== 0) 
  {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


document.getElementById("registration-form")?.addEventListener("submit", function(event) 
{
  event.preventDefault();
  var email = document.getElementById("email").value;
  var userName = document.getElementById("user-name").value;
  console.log("username is this",userName);
  var numofques = document.getElementById("number-question");
  var level = document.querySelector('input[name="level"]:checked');
  var questionCategory = document.querySelector('input[name="category"]:checked');
  console.log(numofques, level, questionCategory, "detailsss");
  if(validateConfig(numofques,level,questionCategory,email,userName))
  {
    numofques = numofques.value;
    level = level.value;
    questionCategory = questionCategory.value;
    var apiUrl = "https://opentdb.com/api.php?amount=" + numofques + "&category=" + questionCategory + "&difficulty=" + level + "&type=multiple";

    fetch(apiUrl)
        .then(function(response) {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
        })
        .then(function(data) 
        {
        validate(data);
        })
        .catch(function(error) 
        {
        console.log("An error occurred:", error);
        });
    }
});

function setSelectedOption(radioBTN)
{
    selectedANS = radioBTN.value;
    console.log(radioBTN.value); 
  }
  
  // Function to move to the next question
  function nextQues() 
  {
    handleAnswerSubmission(selectedANS);
    console.log("Moving to the next question"); 
  }
