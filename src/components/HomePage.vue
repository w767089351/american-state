<template>
  <div class="container">
    <!-- left side show the input bar and dropdown list -->
    <div class="left-column">

      <!-- user input bar -->
      <input v-model="userInput" @input="fetchNames" class="input-bar" ref="inputBar" />

      <!-- dropdown list showing all valid states -->
      <ul v-if="nameList.length" class="dropdown-list center" ref="dropdownList">
        <li v-for="name in nameList" :key="name">

          <!-- use computedName(name) to strength the characters existing in string name  -->
          <button @click="fetchStateDetails(name)" class="name-button" v-html="computedName(name)"></button>

        </li>
      </ul>
    </div>

    <!-- right side show the google map -->
    <div class="right-column">

      <!-- achieve the google map here -->
      <div>
        <GMapMap
          :center="center"
          :zoom="3"
          map-type-id="terrain"
          style="width: 70%; height: 600px"
          >

          <!-- draw Polygon on google map -->
          <GMapPolygon v-if="polygonPath.length > 0"
            :path="polygonPath"
            :options="polygonOptions"
          />

        </GMapMap>
      </div>
    </div>
  </div>
</template>

<!-- all CSS code to define the styling and presentation of elements  -->
<style>

/* define the style and frame of left and right column*/
.left-column {
  float: left; 
  width: 35%;
  height: 100%;
  padding: 10px;
  position: absolute;
}
  
.right-column {
  float: right;
  width: 65%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: 0 auto;
  margin-top: 70px;
}

.center {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
}

/* define the style of input bar and related elements */
.input-bar {
  width: 50%;
  padding: 10px;
  border: 2px solid #3498db;
  border-radius: 5px;
  font-size: 16px;
  color: #333;
}

.input-bar:focus {
  outline: none;
  border-color: #ff6b6b;
}

/* define the style of dropdown list and related elements */
.dropdown-list {
  max-height: 200px;
  width: 50%;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dropdown-list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.name-button {
  width: 100%;
  background-color: white;
  font-size: 13px; 
  color: #0a141a;
  border: none;
  padding: 5px 10px;
  cursor: pointer;

}
.name-button strong {
  font-weight: bold;
}

.name-button:hover {
  background-color: #3498db;
  color: white;
}

</style>

<script>
import axios from 'axios'; 
import { ref } from 'vue';
export default {
  data() {
    return {
      // center is the default coordinate of google map
      center: { lat: 37.0902, lng: -95.7129 },
      // userInput records what users typed in input bar
      userInput: "",
      // nameList records the current valid state names
      nameList: [],
      // polygonPath records all the coordinates of the polygon drew on google map
      polygonPath: ref([]),
      // polygonOptions records the polygon's color and related elements
      polygonOptions: ref({})
    };
  },
  methods: {

    // addClickOutsideListener add eventListnener for users clicking outside of inputBar and dropDown list
    addClickOutsideListener() {
      document.addEventListener('click', this.handleOutsideClick);
    },

    // handleOutsideClick handles the case that users click outside of inputBar and dropDown list
    handleOutsideClick(event) {

      const inputBar = this.$refs.inputBar;
      const dropdownList = this.$refs.dropdownList;

      //if user clicked outside of inputBar and dropDown list, the dropDown list will be closed
      if (dropdownList && !dropdownList.contains(event.target) && !inputBar.contains(event.target)) {
        this.nameList = [];
        document.removeEventListener('click', this.handleOutsideClick); 
      }
    },

    // computedName strength the characters existing in string name 
    computedName(name) {
      const regex = new RegExp(this.userInput, 'gi');
      return name.replace(regex, (match) => `<strong>${match}</strong>`);
    },
    
    // fetchNames call backend graphQL API to query all state names that containing the userInput string
    async fetchNames() {
      
      const query = `query { queryValidStates(keyword: "${this.userInput}") }`;
      this.addClickOutsideListener();

      try {
        // send GraphQL query request
        const response = await axios.post('http://localhost:8080/query', {
          query,
        });
        // get data from response; data.queryValidStates = [String!]
        const data = response.data.data;

        // handle response data and update nameList
        if (data.queryValidStates == null) {
          this.nameList = [];
        } else {
          this.nameList = data.queryValidStates;
        }
        console.log(this.nameList)
      } catch (error) {
        console.error('GraphQL request error:', error);
      }
    },


    // There are some discrepancies between the coordinates in the data and the coordinates of real state boundaries,
    // resulting in inaccuracies when displaying them on the map. Here the fetchStateDetails function works well and 
    // correctly get all coordinates and draw on maps. 

    // fetchStateDetails call backend graphQL API to query the detailed information of the specific state
    async fetchStateDetails(name) {
      const query = 
      `query {
        getStateInfo(keyword: "${name}") { 
          name 
          colour
          points {
            lat
            lng
          }
        }
      }`
      
      try {
        // send graphQL request
        const response = await axios.post('http://localhost:8080/query', {
          query,
        });
        // get data from response; data["points"] = [{lat: String, lng: String}!]!
        const data = response.data.data.getStateInfo; 
        // update polygonPath and polygonOptions
        this.polygonPath = data["points"]
        for (const point of this.polygonPath) {
          point.lat = parseInt(point.lat);
          point.lng = parseInt(point.lng);
        }
        console.log(this.polygonPath);
         
        this.polygonOptions = {
          fillColor: data["colour"],
          fillOpacity: 0.35,
          strokeWeight: 0}
        } catch (error) {
          console.error('GraphQL request error:', error);
        }
      }
    }
};
</script>

