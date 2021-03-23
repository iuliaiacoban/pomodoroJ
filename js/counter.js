// Define the Constructor
function Task(taskDescripion, pomodoroCount, done) {
    this.taskDescripion = taskDescripion;
    this.pomodoroCount = pomodoroCount;
    this.done = done;
}

// Alias for document.getElementById
function $$(id) {
    return document.getElementById(id);
};

// Retrieve data from Local Storage
var itemList = [];
var itemListJson = localStorage.getItem("itemList");

if (itemListJson != "" && itemListJson != null) {
    itemList = JSON.parse(itemListJson);
}

var nrCheckbox = 0;
var nrLi = 0;
var newTask = $$("new-task");

function displayTask() {
    var newTaskVal = $$("new-task").value;
    var pomodoroCountVal = $$("pomodoro-count").innerText;
    var done = false;

    var elem = new Task(newTaskVal, pomodoroCountVal, done);
    itemList.push(elem);

    // Save data to LocalStorage
    var itemListString = JSON.stringify(itemList);
    localStorage.setItem("itemList", itemListString);
}

function drawTheList() {
    var listOfTasks = $$("to-do-list");
    listOfTasks.innerHTML = "";

    // Create the elements for To do list
    for (var index in itemList) {

        // Create the task: retrieve the data from LocalStorage
        var newTaskItem = document.createElement("li");
        var newTaskItemLi = listOfTasks.appendChild(newTaskItem);
        newTaskItemLi.innerHTML = itemList[index].taskDescripion;

        //Create the chekbox
        var checkboxItem = document.createElement("input");
        var checkboxItemLabel = document.createElement("label");

        newTaskItem.id = "li-item_" + nrLi;
        checkboxItem.type = "checkbox";
        checkboxItem.id = "checkbox-item_" + nrCheckbox;
        checkboxItem.setAttribute("data-index", nrCheckbox);
        checkboxItemLabel.htmlFor = checkboxItem.id;
        checkboxItem.className = "input-checkbox";
        newTaskItemLi.appendChild(checkboxItem);
        newTaskItemLi.appendChild(checkboxItemLabel);

        //Create the play button <i>
        var playButton = document.createElement("i");
        playButton.id = checkboxItem.id;

        var pomodoroCount = document.createElement("span");
        pomodoroCount.innerHTML = itemList[index].pomodoroCount;
        pomodoroCount.className = "pomodoro-count";
        pomodoroCount.id = "pomodoro-count_" + nrCheckbox;

        playButton.className = "fa fa-play";
        playButton.id = "fa_" + nrCheckbox;
        playButton.setAttribute("data-index", nrCheckbox);
        newTaskItemLi.appendChild(playButton);
        newTaskItemLi.appendChild(pomodoroCount);

        //Create the Delete button
        var deleteButton = document.createElement("i");
        deleteButton.className = "fa fa-times";
        deleteButton.setAttribute("data-index", nrCheckbox);
        newTaskItemLi.appendChild(deleteButton);

        deleteButton.onclick = function() {
            var deleteButtonParent = deleteButton.parentNode; //el = li#li-item_3
            var deleteButtonId = this.getAttribute("data-index");

            deleteButtonParent.parentNode.removeChild(deleteButtonParent);
            removeTask(deleteButtonId);
        }

        checkboxItem.onclick = updateTheStatus;
        nrCheckbox++;
        nrLi++;

        var setTheVolume = $$("fa-volume-up");
        var playButtonSelected = $$(playButton.id);

        playButtonSelected.onclick = function() {
            var timer = new Timerclock(index, $$("timer-pomodoro").value);
            timer.init();

            if (setTheVolume.classList.contains("fa-volume-up")) {
                $$("timer-sound-tick").play();
            } else {
                $$("timer-sound-tick").pause();
            }
            this.classList.toggle("fa-pause");
        }
        listOfTasks.appendChild(newTaskItemLi);
    }
    updateTheCounter();
}

function removeTask(index) {
    itemList.splice(index, 1);

    var itemListString = JSON.stringify(itemList);
    localStorage.setItem("itemList", itemListString);
}

function updateTheCounter() {
    if ($$("timer-pomodoro").value % 60 < 10) {
        var leadingZero = "0";
    } else {
        leadingZero = "";
    }

    $$("timer-clock-text").innerHTML = parseInt($$("timer-pomodoro").value / 60) + ":" + leadingZero + parseInt($$("timer-pomodoro").value % 60);
}

$$("timer-pomodoro").onchange = function() {
    updateTheCounter();
};

$$("fa-volume-up").onclick = function() {
    $$("fa-volume-up").classList.toggle("fa-volume-up");
};

$$("new-task").onkeypress = function(e) {
    var keyCode = e.keyCode || e.which;

    //If the user presses Enter then call displayTask()
    if (keyCode == "13") {
        if ($$("new-task").value != "") {
            displayTask();
            drawTheList();
            $$("new-task").value = "";
        }
    }
}

function playAndPause() {
    var iSelected = $$(this.id);
    this.classList.toggle("fa-pause");
}

function updateTheStatus() {
    var playButton = this.parentElement.querySelector("i");
    var thisId = this.getAttribute("data-index");

    if (this.checked) {
        for (var thisId in itemList) {
           itemList[thisId].done = true;
        }

        //this.parentNode.className = "to-do-task-done";
        playButton.onclick = function(e) {
            e.preventDefault();
        }
    } else {
        this.parentNode.className = "";
        playButton.onclick = function(e) {
            var timer = new Timerclock(thisId, $$("timer-pomodoro").value);
            timer.init();
        }

         for (var thisId in itemList) {
           itemList[thisId].done = false;
        }
    }

    var itemListString = JSON.stringify(itemList);
    localStorage.setItem("itemList", itemListString);

    if (itemList[thisId].done == true) {
        this.parentNode.className = "to-do-task-done";
    } else {
        this.parentNode.className = "";
    }
}

// Create the timer
function Timerclock(data, seconds) {
    this.totalTime = seconds;
    this.remainingTime = seconds;
    this.data = data;
    this.updateTarget();
}

Timerclock.prototype.updateTarget = function() {
    if (this.remainingTime == 0) {
        for (var index in itemList) {
            itemList[index].pomodoroCount++;
        }
        var itemListString = JSON.stringify(itemList);
        localStorage.setItem("itemList", itemListString);
        $$("timer-clock-text").innerHTML = "0:00";
        $$("timer-sound-end").play();
    }

    //Convert the seconds to minutes
    if (this.remainingTime % 60 < 10) {
        var leadingZero = "0";
    } else { 
        leadingZero = "";
    }

    var timer = parseInt(this.remainingTime / 60) + ":" + leadingZero + parseInt(this.remainingTime % 60);
    $$("timer-clock-text").innerHTML = timer;
    document.title = timer;

    // (1500 - 1498) / 1500 = 0.0013333
    var ratio = (this.totalTime - this.remainingTime) / this.totalTime;
    drawRemainingTime(ratio);
}

document.querySelector(".timer-short-break").onclick = function() {
    clearInterval(self.interval);

    var breakSeconds = parseInt(document.querySelector(".timer-short-break").getAttribute("data-break")); //300
    var timer = new Timerclock(0, breakSeconds);
    timer.init();
    document.querySelector(".timer-short-break").classList.toggle("break-on");
    if ($$("timer-pomodoro").value % 60 == 0) {
        var leadingZero = "0";
    } else {
        leadingZero = "";
    }
    self.interval = parseInt(breakSeconds / 60) + ":" + leadingZero + parseInt(breakSeconds % 60);
    $$("timer-clock-text").innerHTML = self.interval;
}

Timerclock.prototype.init = function() {
    var self = this;
    this.reset();
    var interval = null;
    this.interval = setInterval(function() {
        self.remainingTime--;
        self.updateTarget();
        if (self.remainingTime == 0) {
            clearInterval(self.interval);
            document.querySelector(".timer-short-break").className = "timer-short-break";
        }
    }, 1000);

    // Reset the counter to the initial value
    $$("timer-clock-reset").onclick = function() {
        clearInterval(self.interval);
        if ($$("timer-pomodoro").value % 60 == 0) {
            var leadingZero = "0";
        } else {
            leadingZero = "";
        }
        self.interval = parseInt($$("timer-pomodoro").value / 60) + ":" + leadingZero + parseInt($$("timer-pomodoro").value % 60);
        $$("timer-clock-text").innerHTML = self.interval;
    }

    var elemS = document.querySelector(".timer-short-break");
    document.querySelector(".timer-short-break").onclick = function() {
        clearInterval(self.interval);
        var breakSeconds = parseInt(document.querySelector(".timer-short-break").getAttribute("data-break")); //300
        

        document.querySelector(".timer-short-break").classList.toggle("break-on");

        self.interval = parseInt(breakSeconds / 60) + ":" + parseInt(breakSeconds % 60);
        $$("timer-clock-text").innerHTML = self.interval;
        self.updateTarget();
    }
}

Timerclock.prototype.reset = function() {
    this.remainingTime = this.totalTime;
    this.updateTarget();
    clearInterval(this.interval);
}

// Draw the timer
function canvasTimer() {
    var canvas = $$("timer-clock");
    ctx = canvas.getContext('2d');
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    circumference = Math.PI * 2;
    borderWidth = canvasWidth * 0.02; //6
    innerRingSize = canvasWidth * 0.4; //120
    quart = (Math.PI * 2) / 4;

    // Draw the orange circle
    drawInitialTime = function(radius, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = borderWidth;
        ctx.arc(canvasWidth/2, canvasHeight/2, radius, 0, circumference, false);
        ctx.stroke();
    };

    drawInitialTime(innerRingSize + borderWidth, "#ff9601");

    ctx.beginPath();
    ctx.strokeStyle = '#dadada';
    ctx.closePath();
    ctx.fill();

    // Draw the grey circle
    drawRemainingTime = function(current) {
        ctx.beginPath();
        ctx.arc(canvasWidth/2, canvasHeight/2, innerRingSize + borderWidth, -quart, circumference * current - quart, false);
        ctx.stroke();
    }
}
canvasTimer();