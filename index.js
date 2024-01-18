// --------------------------------- Global Variables -----------------------------------
var isGameOn = true;

var answerLength;  // Updated by user-prompt (Only stores 3 or 4)
var answer = [];  // 3 or 4 digits numbers according to "answerLength": [0, 1, 2]
var answerString = "";  // Keep the answer as a string: '012'

var guess = [];  // User's input: [0, 1, 2, 3...]
var guessHistory = [];  // All the history of user's guess: ['012', '345', '678'...]
var guessForNonAnswer = [];  // Keeps the numbers that are not in the answer for sure while guessing: [3, 4, 5...]

var strike;
var ball;


// --------------------------------- Set the answer -----------------------------------
setAnswer();

// --------------------------------- Interact with user's action -----------------------------------
/**
 * A page can't be manipulated safely until the document is "ready".
 * - 'ready()' to make functions available after the document is loaded
 */
$(document).ready(function () {
    
    // Detect keyboard input and take actions
    detectKeyboardInput();

    // Detect clicking number buttons and take actions
    detectNumBtnClicked();

    // Erase the last number when pressing "backspace" or "delete" key
    detectBackspaceAndDelete();
    
    // Highlight all the same numbers when hovered
    detectMouseHoveringOnNums();

    // 'Play again' button to refresh the website
    detectPlayAgainBtn();
});

function detectNumBtnClicked() {
    // Num-Buttons on Number List
    $("#numList-container .btn").click(function () {
    // only detect mouse-interaction when the game is on.
        if (isGameOn) {
            var inputChar = this.children[0].innerHTML;
            acceptOnlyValidGuess(inputChar);
        };
    });

    // Num-Buttons on Log Table => Dynamically loaded content
    $("#logTable-body").on('click', '.btn-sm', function () {
        // only detect mouse-interaction when the game is on.
        if (isGameOn) {
            var inputChar = this.children[0].innerHTML;
            acceptOnlyValidGuess(inputChar);
        };
    });
};


// --------------------------------- Functions -----------------------------------
/**
 * They are all functions from here.
 * - All the functions are in alphabetical order.
*/

function acceptOnlyValidGuess(inputChar) {
    // Convert charactor into integer number
    var num = parseInt(inputChar);

    // Avoid writing more than 3 numbers or duplicated numbers
    if (guess.length < answerLength && !(guess.includes(num))) {
        guess.push(num);
        displayUserInput(num);
        addClassNumIntoUserGuessBtn(num);

        // Check the answer when user types all the numbers
        if (guess.length == answerLength) {
            checkAnswer();  // It handles all the details inside the function.
        };
    };
};

function addClassNumIntoUserGuessBtn(num) {
    // Add class: num5, num3, num9... 
    var guessIndex = guess.length - 1;
    var numX = "num" + num;
    $("#userAnswer-container .btn").eq(guessIndex).addClass(numX);
};

function addNewRowOnLogTable() {
    // Display result: Add a row into table
    var resultString = manipulateResultString();  // "1S", "2B", "1S2B", "None"..
    var resultHTML = manipulateUserGuessHTML(resultString);  // Table row data HTML
    $("#logTable-body").prepend(resultHTML);

    // Highlight new row for a milli second.
    highlightNewRow();
};

function askAnswerLength() {
    var stringNum = prompt("Choose the length of the answer. Type '3' or '4': ");
    var intNum = parseInt(stringNum);

    if (intNum == 3 || intNum == 4) {
        answerLength = intNum;
        // When user uses 4, unhide the 4th guess button to display it on the browser.
        if (answerLength == 4) {
            unhide4thGuessButton();
        }
    } else {
        alert("Type only '3' or '4'. Try again.");
        askAnswerLength();
    };
};

function changeBgColorBtnHovered(numX) {
    var isGrey = $('#' + numX).hasClass("bg-grey");  // check if it's grey
    if (isGrey) {
        // When it's grey, change it to black
        $("#" + numX).addClass("bg-black");  // on number list
        $("." + numX).addClass("bg-black");  // on log table, user guess
    } else {
        // Otherwise, change it to yellow
        $("#" + numX).addClass("bg-yellow");  // on number list
        $("." + numX).addClass("bg-yellow");  // on log table, user guess
    };
};

function changeBgColorBtnNotHovered(numX) {
    var isGrey = $('#' + numX).hasClass("bg-grey");  // check if it's grey
    if (isGrey) {
        $("#" + numX).removeClass("bg-black");  // on number list
        $("." + numX).removeClass("bg-black");  // on log table, user guess
    } else {
        $("#" + numX).removeClass("bg-yellow");  // on number list
        $("." + numX).removeClass("bg-yellow");  // on log table, user guess
    };
};

function checkAnswer() {
    // Handle all the details for checking answer.

    // Run this only when the guess in not duplicated
    if (!isGuessDuplicated()) {  // Also tracks history of guesses
        countBallAndStrike();
        addNewRowOnLogTable();
        chagneButtonsBGColorToGrey();
    };
    
    // When user finds the answer, the game stops.
    if (hasFoundAnswer()) {
        displayWinningMessage();  // Display winning message below user's guess
        isGameOn = false;   // Stop the game
    } else {
        // When user does't get the answer, empty the user input (and keep the game on).
        emptyUserInputAndDisplay();
    };

    // Remove remained 'yellow' and 'black' bg-color caused by hovering.
    removeRemainedHoveredBGColor();
};

function countBallAndStrike() {
    // Reset "Strike" and "ball" to 0
    strike = 0;
    ball = 0;

    // Count how many "strikes" and "balls" are included.
    for (var i = 0; i < guess.length; i++) {
        if (guess[i] == answer[i]) {
            strike++;
        } else if (answer.includes(guess[i])) {
            ball++;
        };
    };
};

function chagneButtonsBGColorToGrey() {
    // Change Button's Background Color to Grey on both number list and log table.

    // Initially for number list. Track numbers for log table as well.
    if (hasFoundNothing()) {
        // When nothing is found, change the color of chosen numbers to grey
        for (var i = 0; i < guess.length; i++) {
            var numX = "num" + guess[i];
            $("#" + numX).addClass("bg-grey");
            trackNumsForNonAnswer(guess[i]);
        };
    } else if (hasFoundEveryNumber()) {
        // When everything is found, change the color of numbers not chosen to grey
        var tempNumList = [];
        for (var i = 0; i < 10; i++) {
            // if "i" is not on the guess list.
            if (!guess.includes(i)) {
                tempNumList.push(i);
            };
        };
        for (var i = 0; i < tempNumList.length; i++) {
            var numX = "num" + tempNumList[i];
            $("#" + numX).addClass("bg-grey");
            trackNumsForNonAnswer(tempNumList[i]);
        };
    };

    // For number buttons on the log table
    for (var i = 0; i < guessForNonAnswer.length; i++) {
        var numX = `num${guessForNonAnswer[i]}`
        $("." + numX).addClass("bg-grey");
    };
};

function detectBackspaceAndDelete() {
    // Erase the last number when pressing "backspace" or "delete" key
    $(document).keydown(function(event) {
        // only detect mouse-interaction when the game is on.
        if (isGameOn) {
            var KeyID = event.keyCode;
            // only works when there is at least 1 guess-number exists.
            if (guess.length > 0) {
                switch (KeyID) {
                    case 8:  // "Backspace" key
                    case 46:  // "Delete" key
                        var guessIndex = guess.length -1;
                        $(".userAnswer-num")[guessIndex].innerHTML = "_";
                        $("#userAnswer-container .btn").eq(guessIndex).removeClass("num" + guess[guessIndex]);
                        $("#userAnswer-container .btn").eq(guessIndex).removeClass("bg-grey");
                        guess.pop();
                        break;
                    default:
                        break;
                };
            };
        };
    });
};

function detectKeyboardInput() {
    $(document).keypress(function (event) {
        // only detect keyboard-input when the game is on.
        if (isGameOn) {
            var inputChar = event.key;
            
            // When the key pressed is a number(but in a charactor-type yet)
            if (isNumber(inputChar)) {
                acceptOnlyValidGuess(inputChar);
            } else {
                // When the key pressed is not a number
                alert("It only accepts numbers.");
            };
        };
    });
};

function isNumber(inputChar) {
    // If the input-character is in numList, return true. Otherwise false.
    var numList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (numList.includes(inputChar)) {
        return true;
    } else {
        return false;
    };
};

function detectMouseHoveringOnNums() {
    getNumHoveredOnNumList();
    getNumHoveredOnLogTable();
    getNumHoveredOnUserGuess();
};

function detectPlayAgainBtn() {
    // When "Play again" button clicked
    $("#playAgainBtn").click(function() {
        // Refresh the website
        location.reload();
    });
};

function displayUserInput(num) {
    var guessIndex = guess.length - 1;
    $(".userAnswer-num")[guessIndex].innerHTML = num;

    // change bg-color if the guess is not on the answer for sure.
    if (guessForNonAnswer.includes(num)) {
        $("#userAnswer-container .btn").eq(guessIndex).addClass("bg-grey");
    };
};

function displayWinningMessage() {
    // Change text to the answer
    $("#answer-display").text(`You have got the right answer: ${answerString}.`);

    // Unhide winning message
    $("#winning-message").removeClass("hideBtn");
    
    // Show pop-up browser after displaying all the winning message on the page
    setTimeout(function () {
        alert("You win!");
    }, 100);
};

function emptyUserInputAndDisplay() {
    // Delay emptying the user inputs for certain milliseconds.
    setTimeout(function () {
        for (var i = guess.length - 1; i >= 0; i--) {
            // empty it from the last one using '.pop()'
            $(".userAnswer-num")[i].innerHTML = "_";
            $("#userAnswer-container .btn").eq(i).removeClass("num" + guess[i]);
            $("#userAnswer-container .btn").eq(i).removeClass("bg-grey");
            guess.pop();
        };
    }, 100);
};

function getNumHoveredOnLogTable() {
    // When hovered
    $(document).on('mouseenter', '.btn-sm', function () {
        var classListString = this.className  // "btn btn-sm num1 bg-grey" (String)
        var classList = classListString.split(/(\s+)/);  // regex
        var numX = classList[4];  //num1
        changeBgColorBtnHovered(numX);
    });

    // When not hovered anymore, change it back to its original color.
    $(document).on('mouseleave', '.btn-sm', function () {
        var classListString = this.className  // "btn btn-sm num1 bg-grey" (String)
        var classList = classListString.split(/(\s+)/);  // regex
        var numX = classList[4];  //num1
        changeBgColorBtnNotHovered(numX);
    });

    /**
     * regex explanation:
     * '\s' matches any character that is a whitespace, adding the plus makes it greedy, 
     * matching a group starting with characters and ending with whitespace, 
     * and the next group starts when there is a character after the whitespace etc.
     */
};

function getNumHoveredOnNumList() {
    // When hovered
    $(document).on('mouseenter', '#numList-container .btn', function () {
        var numX = this.id;  //num1
        changeBgColorBtnHovered(numX);
    });

    // When not hovered anymore, change it back to its original color.
    $(document).on('mouseleave', '#numList-container .btn', function () {
        var numX = this.id;  //num1
        changeBgColorBtnNotHovered(numX);
    });
};

function getNumHoveredOnUserGuess() {
    // When hovered
    $(document).on('mouseenter', '#userAnswer-container .btn', function () {
        var num = $(this).children()[0].innerHTML;
        if (num == '_') {
            // When there's no number on the button
            $(this).addClass("bg-yellow");
        } else {
            // When there's number on the button
            var numX = "num" + num;
            changeBgColorBtnHovered(numX);
        };
    });
    // When not hovered anymore, change it back to its original color.
    $(document).on('mouseleave', '#userAnswer-container .btn', function () {
        var num = $(this).children()[0].innerHTML;
        if (num == '_') {
            // When there's no number on the button
            $(this).removeClass("bg-yellow");
        } else {
            var numX = "num" + num;
            // When there's number on the button
            changeBgColorBtnNotHovered(numX);
        };
    });
};

function hasFoundAnswer() {
    if (strike == answerLength) {
        return true;
    } else {
        return false;
    };
};

function hasFoundEveryNumber() {
    var rightGuessNum = strike + ball;
    if (rightGuessNum == answerLength) {
        return true;
    } else {
        return false;
    };
};

function hasFoundNothing() {
    // If there's no strike or ball, return true. Otherwise return false.
    if (!strike && !ball) {
        return true;
    } else {
        return false;
    };
};

function highlightNewRow() {
    // Highlight new row on the table for a milli second.
    var nthGuess = guessHistory.length;
    var userGuessRowNoClass = `.userGueesNo${nthGuess}`;

    $(userGuessRowNoClass).addClass("highLightNewRow");
    setTimeout(function () {
        $(userGuessRowNoClass).removeClass("highLightNewRow");
    }, 300);
};

function isGuessDuplicated() {
    // Check if user has already guessed the same numbers.
    var tempGuessString = guess.join('');
    if (guessHistory.includes(tempGuessString)) {
        alert("You've already tried that guess: " + tempGuessString);
        return true;
    } else {
        // if user hasn't input this numbers before, save it to check duplication later.
        guessHistory.push(tempGuessString);
        return false;
    };
};

function manipulateResultString() {
    // This returns like: "1S", "2B", "1S2B", "None"...
    var resultString = "";
    if (strike) {
        resultString += (strike + "S");
    };

    if (ball) {
        resultString += (ball + "B");
    };

    if (hasFoundNothing()) {
        resultString += "None";
    };

    return resultString;
};

function manipulateUserGuessHTML(resultString) {
    // Manipulate user's guess to add a row into the log table later
    var userGuessHTML = "";
    for (var i = 0; i < guess.length; i++) {
        userGuessHTML += `<div class="btn btn-sm num${guess[i]}"><p>${guess[i]}</p></div>`;
    };

    var nthGuess = guessHistory.length;
    var resultHTML = `<tr class="userGueesNo${nthGuess}"><td>${nthGuess}</td><td>${userGuessHTML}</td><td>${resultString}</td></tr>`;
    return resultHTML;
};

/**
 * When hovering a button and checking the answer happens at the same time,
 * if the BG color of numbers user guessed are changed to grey,
 * the hovered button stays yellow even when it's not being hovered anymore.
 * (or black when it's grey when it's not hovered.)
 * Solution: Looping through all the buttons and remove all 'bg-yellow' and 'bg-black' classes.
 */ 
function removeRemainedHoveredBGColor() {
    // Remove all "bg-yellow" classes from all the buttons.
    // Delay a millisecond to wait for all the actions done, so it can remove everything at once.
    setTimeout(function () {
        $(".btn").removeClass("bg-yellow bg-black");
    }, 100);
};

function setAnswer() {
    askAnswerLength();

    // Generate answer
    while (answer.length < answerLength) {
        var randomNum = Math.floor(Math.random() * 10);  // 0 ~ 9:

        // Numbers cannot be duplicated.
        if (!answer.includes(randomNum)) {
            answer.push(randomNum);
        };
    };

    answerString = answer.join('');

    // Only can be seen on console for test purpose.
    console.log("Psst... The answer: " + answerString);
};

function trackNumsForNonAnswer(num) {
    // For number on log table
    if (!guessForNonAnswer.includes(num)) {
        // If the numbers was not in "guess For Non Answer", then add it.
        guessForNonAnswer.push(num);
    };
};

function unhide4thGuessButton() {
    $("#userAnswer4thDigit").removeClass("hideBtn");
};