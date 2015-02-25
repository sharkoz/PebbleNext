var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');
 
// Show splash screen while waiting for data
var splashWindow = new UI.Window();

var resultsMenu = new UI.Menu();

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Mise a jour des horaires...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});
 
// Add to splashWindow and show
splashWindow.add(text);
console.log("Splash text added");
/*
splashWindow.show();
//*/


var parseFeed = function(data, quantity) {
  var items = [];
  quantity = data.passages.train.length;
  for(var i = 0; i < quantity; i++) {
    // Always upper case the description string
    var title = data.passages.train[i].term;
    title = title.charAt(0).toUpperCase() + title.substring(1);
 
    // Get date/time substring
    var time = data.passages.train[i].date.val;
    time = time.substring(time.indexOf(' ') + 1, time.indexOf(':') + 3);
 
    // Add to menu items array
    items.push({
      title:title,
      subtitle:time
    });
  }
 
  // Finally return whole array
  return items;
};

var refresh = function(data){
      // Create an array of Menu items
    var menuItems = parseFeed(data, 10);
 
    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: data.titre,
        items: menuItems
      }]
    });
 
    // Add an action for SELECT
resultsMenu.on('select', function(e) {
  // Get that forecast
  var forecast = data.list[e.itemIndex];
 
  // Assemble body string
  var content = data.list[e.itemIndex].weather[0].description;
 
  // Capitalize first letter
  content = content.charAt(0).toUpperCase() + content.substring(1);
 
  // Add temperature, pressure etc
  content += '\nTemperature: ';
 
      // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:'Details',
        subtitle:e.item.subtitle,
        body: content
      });
      detailCard.show();
    });
 
    // Show the Menu, hide the splash
    resultsMenu.show();
    splashWindow.hide();
    Vibe.vibrate('short');
    
    // Register for 'tap' events
    resultsMenu.on('accelTap', function(e) {
      // Make another request to server
      
      getproche()
      
    });
};

var getproche = function(){
 
splashWindow.show();
  resultsMenu.hide();

console.log("Splash window showed");
  
  navigator.geolocation.getCurrentPosition(
  function(pos) {
    var url = "http://rlier.fr/ligne-server/live-proche" +
      "/" + pos.coords.latitude +
      "/" + pos.coords.longitude;
    ajax(
      { url: url, type: 'json' },
      function(data) {
        refresh(data);
      },  
      function (err) { console.log("Network error: " + err); }
    );
},
function (err) { console.log("Gps error: " + JSON.stringify(err)); }, { timeout: 10000 } //remember to add an error function for the GPS.
);
  
};

getproche();

 
// Prepare the accelerometer
Accel.init();