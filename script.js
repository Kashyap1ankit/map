"use strict";

const formInput = document.querySelector(".form");
const wholeForm = document.querySelector(".form--detail");
const selectType = document.getElementById("type");
const distance = document.getElementById("distance");
const duration = document.getElementById("duration");
const cadence = document.getElementById("cadence");
const elevation = document.getElementById("elevation");
const goBtn = document.querySelector('.submitbtn');
const workoutSection = document.querySelector(".workout-type");
const changeable = document.querySelectorAll('.changeable');
const modal = document.querySelector(".invalid-modal");
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const mapSection = document.getElementById("map");
const cutModal = document.querySelector(".cut-modal");

//Making the map and mapEvent global varibales

let map;
let mapEvent;
let workout;

//Creating a parent workout class

class Workout {

  date = new Date();
  id = String(Date.now()).slice(-5)

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

//Creating the Running workout class

class Running extends Workout {
  constructor(coords, distance, duration, cadence, type) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = "Running"
  }
}

//Creating the Cycling workout class

class Cycling extends Workout {
  constructor(coords, distance, duration, elevation, type) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.type = "Cycling"
  }
}

//Creating workout for every click

const _createWorkout = function() {

  const distanceMarker = +distance.value;
  const durationMarker = +duration.value;
  const coordsMarker = [mapEvent.latlng.lat, mapEvent.latlng.lat];

  if (selectType.value === "running") {
    const cadenceMarker = +cadence.value;
    workout = new Running(coordsMarker, distanceMarker, durationMarker, cadenceMarker)
  }

  if (selectType.value === "cycling") {
    const elevationMarker = +elevation.value;
    workout = new Cycling(coordsMarker, distanceMarker, durationMarker, elevationMarker)

  }

}

//Validating the inputs are valid or not?

const _validInputs = function(workout) {

  if (workout.type === "Running") {
    if (Number.isFinite(workout.distance) && Number.isFinite(workout.duration) && Number.isFinite(workout.cadence))
      return true
  }


  if (workout.type === "Cycling") {
    if (Number.isFinite(workout.distance) && Number.isFinite(workout.duration) && Number.isFinite(workout.elevation))
      return true
  }

};

const _positiveInputs = function(workout) {
  if (workout.type === "Running") {
    if (workout.distance > 0 && workout.duration > 0 && workout.cadence > 0)
      return true
  }

  if (workout.type === "Cycling") {
    if (workout.distance > 0 && workout.duration > 0 && workout.elevation > 0)
      return true
  }
}
//Removing the Input field form when go button is clicked and appearing the marker then

const _hideForm = function() {

  //Creating the workout after every click

  _createWorkout();

  //Validating the inputs

  if (_validInputs(workout) && _positiveInputs(workout)) { //Showing the marker with the help of created workout

    _appearmarker(workout);

    //Showing the workout details

    _revealWorkout(workout);

    //Hiding the from

    formInput.classList.add("form-hidden");
    distance.value = duration.value = elevation.value = cadence.value = ""
  }

  else {
    _modalOpen()
  }

}


//Displaying the marker on map

const _appearmarker = function(workout) {

  // e.preventDefault();

  //Geeting the information where the map is clicked last
  {
    const { lat, lng } = mapEvent.latlng;
    const hour = workout.date.getHours();
    const minute = workout.date.getMinutes();


    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
      })).setPopupContent(`${workout.type === "Running" ? "🏃" : "🚴‍♂️"}${workout.type} on ${workout.date.getDate()} ${months[workout.date.getMonth()]} at ${hour}:${minute}`)
      .openPopup();
  }

}

//Revealing the input and getting the distance input in focus

const revealInput = function(mapE) {
  mapEvent = mapE;
  formInput.classList.remove("form-hidden")
  distance.focus();
}

//Revealing the workout detail

const _revealWorkout = function(workout) {
  let html;

  if (workout.type === "Running") {
    html = `<ul class="workout-type">
             <li class="running-workout">
          <h4> Running on ${workout.date.getDate()} ${months[workout.date.getMonth()]}</h4>
          <div class="display-workout">
            <div class="workout-distance">🏃${workout.distance} KM</div>
            <div class="workout-duration">⌛${workout.duration} Min</div>
            <div class="workout-speed">⚡${workout.duration / workout.distance} Min/Km</div>
            <div class="workout-pace">🐾 ${workout.cadence} SPM</div>
          </div>
        </li>
        </ul>`}

  if (workout.type === "Cycling") {
    html = ` <ul class="workout-type">
    <li class="cycling-workout">
          <h4>Cycling on  ${workout.date.getDate()} ${months[workout.date.getMonth()]}</h4>
          <div class="display-workout">
            <div class="workout-distance">🚴‍♂️${workout.distance} KM</div>
            <div class="workout-duration">⌛${workout.duration} Min</div>
            <div class="workout-speed">⚡${workout.duration / workout.distance} Min/Km</div>
            <div class="workout-pace">🔼  ${workout.elevation} M</div>
          </div>
        </li>
         </ul>`
  }

  formInput.insertAdjacentHTML("afterend", html)

}

//Getting the positon of the user

const _getLocation = function(position) {

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //When map is clicked

  map.on('click', revealInput)

};

//Adding the event listner on input fields

goBtn.addEventListener('click', _hideForm)

//Changing the cadence and elevation

const _changeCadence = function() {
  changeable.forEach(function(ele) {
    ele.classList.toggle("cadenceHidden")
  })
  distance.value = duration.value = elevation.value = cadence.value = ""
}

const _cutmodalfn = function() {
  modal.classList.add("modal-hidden");
  wholeForm.style.filter = "blur(0px)";
  mapSection.style.filter = "blur(0px)";

  distance.value = duration.value = elevation.value = cadence.value = "";
  distance.focus();
}

//Reveal the modal and blur background

const _modalOpen = function() {
  modal.classList.remove("modal-hidden");
  wholeForm.style.filter = "blur(5px)";
  mapSection.style.filter = "blur(10px)";
  distance.value = duration.value = elevation.value = cadence.value = "";
  distance.focus();
}

//When cut modal is clicked

cutModal.addEventListener('click', _cutmodalfn)

//Whenever the type of workout is chnaged then elevation and cadence got toggled

selectType.addEventListener("change", _changeCadence)


//Calling the API

navigator.geolocation.getCurrentPosition(_getLocation, function() {
  alert("Can't Get your location");
});


