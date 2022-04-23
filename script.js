'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  
  constructor(coords, duration, description , type) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.duration = duration;
    this.description = description;
    this.type = type
    this.setDescription();
  }

  setDescription() {
    
    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    

    this.descriptions = `${this.type}  ${
        months[this.date.getMonth()]
      } ${this.date.getDate()}`;
  }


}







///////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDescription = document.querySelector('.form__input--description');
const inputDuration = document.querySelector('.form__input--duration');
const removeDesription = document.querySelector('.removeself');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {

    

    // Get user's position
    this.getPosition();

    // Get data from local storage
   this.getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this.newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this.moveToPopup.bind(this));
  removeDesription.addEventListener('click', this.removeItem.bind(this))


    
  
  }

  getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this.showForm.bind(this));

    this.#workouts.forEach(work => {
      this.renderWorkoutMarker(work);
    });
  }

  showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputType.focus();
   
  }
  hideForm() {
    // Empty inputs
        // Hide form + clear input fields
    
        inputType.value = inputDuration.value = inputDescription.value ='';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  
    // Empty inputs
    
  

  

  newWorkout(e) {
    
    
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const description = inputDescription.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    let workout;

     

      // Check if data is valid
    

      workout = new Workout([lat, lng], duration, description, type);
    

   

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this.renderWorkoutMarker(workout);

    // Render workout on list
    this.renderWorkout(workout);

this.hideForm();

    // Set local storage to all workouts
  this.setlocalStore();
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'workout-popup',
        })
      )
      .setPopupContent(`${workout.descriptions}`)
      .openPopup();
  }

  renderWorkout(workout) {
    let html = `
    <button class="removeself">Usuń</button>
    <li class="workout workout-popup" data-id="${workout.id}">
     <h2 class="workout__title">${workout.descriptions}</h2>
     <div class="workout__details">
       <span class="workout__icon">🏋️</span>
       <span class="workout__unit">${workout.type}</span>
       
     </div>
     <div class="workout__details">
       <span class="workout__icon">⏱</span>
       <span class="workout__value">${workout.duration}</span>
       <span class="workout__unit">min</span>
     </div>
     <div class="workout__details">
       <span class="workout__icon">⚡️</span>
       <span class="workout__unit">${workout.description}</span>
     </div>
    
  
`; 
    
      

    form.insertAdjacentHTML('afterend', html);
  }

  moveToPopup(e) {
    // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, 12, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }
  setlocalStore() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this.renderWorkout(work);
    });
  }

  // reset() {
  //   localStorage.removeItem('workouts');
  //   location.reload();
  // }
  removeItem(){
    form.removeAttribute('li')
    localStorage.removeItem('workouts');
    location.reload();
  }


}

const app = new App();
