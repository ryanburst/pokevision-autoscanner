/**
 * This chrome extension is based off of the work by Dan Leveille
 * and his original bookmarklet which can be found here: http://lev.me/pokevision
 *
 * This chrome extension is made to sit on top of the PokeVision website
 * and alert you to rare pokemon that show up via their scans.
 *
 * @author  Ryan Burst
 * @link https://github.com/ryanburst/pokevision-autoscanner
 */




/**
 * Wrapper class for notifying the user. Defaults
 * to using chrome notifications, but can fallback
 * to using regular alerts.
 */
class Messenger {
  /**
   * Taking object for more options in the future.
   *
   * @param  {Object} options Currently doesn't do much
   */
  constructor(options) {
    options = options || {};

    this.setType(options.type || 'notifications');
  }

  /**
   * Sets what type of messenger this will be. Notifications
   * uses chrome notifications API and anything else will
   * use default JS alerts.
   *
   * @param {String} type notifications|alerts
   */
  setType(type) {
    this.type = type;

    // Immediately request permission to use chrome notifications
    if( this.type === 'notifications' ) {
      this.requestPermission();
    }
  }

  /**
   * Makes the check to see if we have permission to use chrome
   * notifications and if we don't, requests it.
   */
  requestPermission() {
    if (Notification.permission !== "granted"){
      Notification.requestPermission();
    }
  }

  /**
   * Sends the user a message. What type of message they get
   * depends on the settings.
   *
   * @param  {String} message The message sent to the user
   */
  send(message) {
    // Use an alert if the user hasn't granted permission or they just
    // dont want to use chrome notifications
    if(this.type !== "notifications" || Notification.permission !== "granted") {
      Notification.requestPermission();
      return alert(message);
    }

    var notification = new Notification('Notification title', {
      icon: 'https://raw.githubusercontent.com/ryanburst/pokevision-autoscanner/master/icon.png',
      body: message,
    });
  }
}

/**
 * App Class. Handles instantiation of all app related settings and
 * other classes. Sets up the scan and looks for rare pokemon on an interval.
 */
class PokeScan {
  /**
   * Kicks off the scanner by pulling in the PokeDex from the PokeVision page.
   * Once we have a PokeDex we can turn the scanner on and begin looking
   * for rare pokemon.
   *
   * Scanning for pokemon is dependent on getting the PokeDex from the page.
   *
   * TODO: Some kind of message for if we don't get a PokeDex in a certain
   * amount of time?
   *
   * @param  {Object} options Currently doesn't do much
   */
  constructor(options) {
    options = options || {};

    this.pokedex = {};
    this.rarePokemon = [1,2,3,4,5,6,7,8,9,25,26,31,34,36,38,42,43,44,45,47,51,53,55,61,62,64,65,68,69,70,71,73,76,78,80,81,82,83,85,86,87,88,89,92,93,94,95,97,99,100,101,103,105,106,107,108,109,110,112,113,114,115,117,119,122,123,124,125,126,127,128,139,141,130,131,132,134,135,136,137,142,143,144,145,146,147,148,149,150,151];
    this.scanDelay = 10;
    this.showAlerts = true;
    this.playSounds = true;
    this.foundRares = [];
    this.soundURL = 'https://www.freesound.org/data/previews/80/80921_1022651-lq.mp3';

    this.loadPokedex();
  }

  /**
   * Sneaky way of accessing the PokeVision JS objects. By inserting
   * a script to the page (we have access to the DOM) and being able
   * to listen to post messages, we can send out the object via the
   * postMessage and collect it here. Sneaky.
   *
   * Once the PokeDex has been found, we can set it to our local property
   * and begin scanning for rare pokemon.
   */
  loadPokedex() {
    var port = chrome.runtime.connect();
    var that = this;
    window.addEventListener("message", function(event) {
      // We only accept messages from ourselves
      if (event.source != window)
        return;

      if (event.data.type && (event.data.type == "FROM_PAGE") && event.data.pokedex) {
        that.pokedex = event.data.pokedex;
        // Now that we have the pokedex, we can turn the scanner on and start scanning.
        that.on();
      }
    }, false);

    var elt = document.createElement("script");
    elt.innerHTML = "window.postMessage({ type: 'FROM_PAGE', pokedex: App.home.pokedex }, '*');";
    document.body.appendChild(elt);
  }

  /**
   * Does exactly what you think it does. Plays a sound.
   */
  playSound() {
    var a = new Audio(this.soundURL);
    a.play();
  }

  /**
   * Turns the autoscan on. Leaves a visual indicator on the PokeVision
   * page and begins to scan for rare pokemon.
   */
  on() {
    this.messenger = new Messenger();
    $('.header-logo').first().append('<b style="font-size:.6em;color:#86ca76;">AUTOSCAN ON</b>');
    var style = $('<style>.rare{background-color:rgba(0,255,0,.3);border-radius:50%;}</style>');
    $('html > head').append(style);

    this.scan();
  }

  /**
   * Scans for rare pokemon by looking through the DOM for Pokemon icons.
   * Loops through the found Pokemon and compares them to a list of rare
   * pokemon. If the found pokemon is rare, we add a visual indicator
   * and add them to a list so that we can notify the user some were found.
   */
  scan() {

    var icons = $('.leaflet-marker-icon');
    var rareFound = false;
    var rares = '';

    for(var i in icons){
      var re = /([\w+]+).\w+\s*$/;
      var str = icons[i].src;
      var m = re.exec(str);
      var id = m[1];
      if(this.rarePokemon.indexOf(parseInt(id)) > -1){
        var zid = $(icons[i]).parent().css('z-index');
        if(this.foundRares.indexOf(zid) == -1){
          $(icons[i]).addClass('rare');
          this.foundRares.push(zid);
          rareFound = true;
          rares += this.pokedex[id] + ' ';
        }
      }
    }

    if(rareFound){
      var rareMsg = 'Rare Pokemon found: ' + rares;
      if(this.playSounds){
        this.playSound();
        if(this.showAlerts){
          setTimeout(this.messenger.send.bind(this.messenger,rareMsg),100);
        }
      } else if(this.showAlerts){
        this.messenger.send(rareMsg);
      }
    }
    $('.home-map-scan').click();
    setTimeout(this.scan.bind(this), this.scanDelay * 1000);
  }
}

var scanner = new PokeScan();