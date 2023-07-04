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
const deleteData = document.querySelector('.deleteData');


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



class App {

  //Making the map and mapEvent global varibales

  #map;
  #mapEvent;
  #workoutsArray = [];

  constructor() {


    //1.Calling the API

    navigator.geolocation.getCurrentPosition(this._getLocation.bind(this), function() {
      alert("Can't Get your location");
    });

    //2.Adding the event listner on input fields 


    goBtn.addEventListener('click', this._hideForm.bind(this))


    //3.When cut modal is clicked

    cutModal.addEventListener('click', this._cutmodalfn.bind(this))

    //4.Whenever the type of workout is chnaged then elevation and cadence got toggled

    selectType.addEventListener("change", this._changeCadence.bind(this))

    //5.Getting data

    this._getData()

    //6.Deleting data

    deleteData.addEventListener("click", this._deletData.bind(this))
  }



  //Getting the positon of the user

  _getLocation = function(position) {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    this.#map = L.map("map").setView([lat, lng], 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Adding marker when loads

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
      })).setPopupContent("Here You Are😉")
      .openPopup();

    //When map is clicked

    this.#map.on('click', this.revealInput.bind(this))

  };


  //Revealing the input and getting the distance input in focus

  revealInput = function(mapE) {
    this.#mapEvent = mapE;
    formInput.classList.remove("form-hidden")
    distance.focus();
  }



  //Creating workout for every click

  _createWorkout = function() {

    let workout;

    const distanceMarker = +distance.value;
    const durationMarker = +duration.value;
    const coordsMarker = [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lat];

  
    if (selectType.value === "running") {
      const cadenceMarker = +cadence.value;
      
      if (Number.isFinite(distanceMarker) && Number.isFinite(durationMarker) && Number.isFinite(cadenceMarker) && distanceMarker > 0 && durationMarker > 0 && cadenceMarker > 0)  { 
        
        workout = new Running(coordsMarker, distanceMarker, durationMarker, cadenceMarker) 
                                                                                                                                                                                 this.#workoutsArray.push(workout)
      }

       else {
      this._modalOpen()

    }

    }

    if (selectType.value === "cycling") {
      const elevationMarker = +elevation.value;
      if (Number.isFinite(distanceMarker) && Number.isFinite(durationMarker) && Number.isFinite(elevationMarker) && distanceMarker > 0 && durationMarker > 0 && elevationMarker > 0) { 
        workout = new Cycling(coordsMarker, distanceMarker, durationMarker, elevationMarker) 

        this.#workoutsArray.push(workout)
      }

       else {
      this._modalOpen()
    }

    }

    

    //Validating the inputs

    if (this._validInputs(workout) && this._positiveInputs(workout)) { //Showing the marker with the help of created workout

      this._appearmarker(workout);

      //Showing the workout details

      this._revealWorkout(workout);
    }

    else {
      this._modalOpen()
    }


  }


  //Removing the Input field form when go button is clicked and appearing the marker then

  _hideForm = function() {

    //Creating the workout after every click

    this._createWorkout();

    //Setting the data

    this._setData()

    //Hiding the from

    formInput.classList.add("form-hidden");
    distance.value = duration.value = elevation.value = cadence.value = ""
  }



  //Reveal the modal and blur background

  _modalOpen = function() {
    modal.classList.remove("modal-hidden");
    wholeForm.style.filter = "blur(5px)";
    mapSection.style.filter = "blur(10px)";
    distance.value = duration.value = elevation.value = cadence.value = "";
    distance.focus();
  }

  //Displaying the marker on map

  _appearmarker = function(workout) {

    //Geeting the information where the map is clicked last

    const { lat, lng } = this.#mapEvent.latlng;
    const hour = workout.date.getHours();
    const minute = workout.date.getMinutes();


    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
      })).setPopupContent(`${workout.type === "Running" ? "🏃" : "🚴‍♂️"}${workout.type} on ${workout.date.getDate()} ${months[workout.date.getMonth()]} at ${hour}:${minute}`)
      .openPopup();


  }


  //Changing the cadence and elevation

  _changeCadence = function() {
    changeable.forEach(function(ele) {
      ele.classList.toggle("cadenceHidden")
    })
    distance.value = duration.value = elevation.value = cadence.value = ""
  }


  //When cut mark is clicked then modal get closed

  _cutmodalfn = function() {
    modal.classList.add("modal-hidden");
    wholeForm.style.filter = "blur(0px)";
    mapSection.style.filter = "blur(0px)";

    distance.value = duration.value = elevation.value = cadence.value = "";
    distance.focus();
  }

  //Revealing the workout detail

  _revealWorkout = function(workout) {
    let html;

    // const date = workout.date.getDate();
    // const month = months[workout.date.getMonth()];
    if (workout.type === "Running") {
      html = `<ul class="workout-type">
             <li class="workout running-workout"  data-id="${workout.id}">
          <h4> Running </h4>
          <div class="display-workout">
            <div class="workout-distance">🏃${workout.distance} KM</div>
            <div class="workout-duration">⌛${workout.duration} Min</div>
            <div class="workout-speed">⚡${(workout.duration / workout.distance).toFixed(1)} Min/Km</div>
            <div class="workout-pace">🐾 ${workout.cadence} SPM</div>
          </div>
        </li>
        </ul>`}

    if (workout.type === "Cycling") {
      html = ` <ul class="workout-type">
    <li class="workout cycling-workout" data-id="${workout.id}">
          <h4>Cycling<h4>
          <div class="display-workout">
            <div class="workout-distance">🚴‍♂️${workout.distance} KM</div>
            <div class="workout-duration">⌛${workout.duration} Min</div>
            <div class="workout-speed">⚡${(workout.duration / workout.distance).toFixed(1)} Min/Km</div>
            <div class="workout-pace">🔼  ${workout.elevation} M</div>
          </div>
        </li>
         </ul>`
    }

    formInput.insertAdjacentHTML("afterend", html)

  }

  //Validating the inputs are valid or not?

  _validInputs = function(workout) {

    if (workout.type === "Running") {
      if (Number.isFinite(workout.distance) && Number.isFinite(workout.duration) && Number.isFinite(workout.cadence))
        return true
    }


    if (workout.type === "Cycling") {
      if (Number.isFinite(workout.distance) && Number.isFinite(workout.duration) && Number.isFinite(workout.elevation))
        return true
    }

  };

  _positiveInputs = function(workout) {
    if (workout.type === "Running") {
      if (workout.distance > 0 && workout.duration > 0 && workout.cadence > 0)
        return true
    }

    if (workout.type === "Cycling") {
      if (workout.distance > 0 && workout.duration > 0 && workout.elevation > 0)
        return true
    }
  }

  //Storing the data

  _setData() {
    localStorage.setItem('workout', JSON.stringify(this.#workoutsArray))
  }



  _getData() {
    const data = JSON.parse(localStorage.getItem('workout'));

    if (!data) return;

    this.#workoutsArray = data;

    this.#workoutsArray.forEach(work =>
      this._revealWorkout(work)
    )
  }

  _deletData() {
    localStorage.removeItem('workout');
    location.reload();
  }

}



const app = new App();
