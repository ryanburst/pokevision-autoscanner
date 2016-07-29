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


class Rares {
  constructor() {
    this.defaults = [
      1, // Bulbasaur
      2, // Ivysaur
      3, // Venusaur
      4, // Charmander
      5, // Charmeleon
      6, // Charizard
      7, // Squirtle
      8, // Wartortle
      9, // Blastoise
      // 10, // Caterpie
      // 11, // Metapod
      // 12, // Butterfree
      // 13, // Weedle
      // 14, // Kakuna
      // 15, // Beedrill
      // 16, // Pidgey
      // 17, // Pidgeotto
      // 18, // Pidgeot
      // 19, // Rattata
      // 20, // Raticate
      // 21, // Spearow
      // 22, // Fearow
      // 23, // Ekans
      // 24, // Arbok
      25, // Pikachu
      26, // Raichu
      // 27, // Sandshrew
      // 28, // Sandslash
      // 29, // Nidoran♀
      // 30, // Nidorina
      31, // Nidoqueen
      // 32, // Nidoran♂
      // 33, // Nidorino
      34, // Nidoking
      // 35, // Clefairy
      36, // Clefable
      // 37, // Vulpix
      38, // Ninetales
      // 39, // Jigglypuff
      // 40, // Wigglytuff
      // 41, // Zubat
      42, // Golbat
      43, // Oddish
      44, // Gloom
      45, // Vileplume
      // 46, // Paras
      47, // Parasect
      // 48, // Venonat
      // 49, // Venomoth
      // 50, // Diglett
      51, // Dugtrio
      // 52, // Meowth
      53, // Persian
      // 54, // Psyduck
      55, // Golduck
      // 56, // Mankey
      // 57, // Primeape
      // 58, // Growlithe
      59, // Arcanine
      // 60, // Poliwag
      61, // Poliwhirl
      62, // Poliwrath
      // 63, // Abra
      64, // Kadabra
      65, // Alakazam
      // 66, // Machop
      // 67, // Machoke
      68, // Machamp
      69, // Bellsprout
      70, // Weepinbell
      71, // Victreebel
      // 72, // Tentacool
      73, // Tentacruel
      // 74, // Geodude
      // 75, // Graveler
      76, // Golem
      // 77, // Ponyta
      78, // Rapidash
      // 79, // Slowpoke
      80, // Slowbro
      81, // Magnemite
      82, // Magneton
      83, // Farfetch'd
      // 84, // Doduo
      85, // Dodrio
      86, // Seel
      87, // Dewgong
      88, // Grimer
      89, // Muk
      // 90, // Shellder
      // 91, // Cloyster
      92, // Gastly
      93, // Haunter
      94, // Gengar
      95, // Onix
      // 96, // Drowzee
      97, // Hypno
      // 98, // Krabby
      99, // Kingler
      100, // Voltorb
      101, // Electrode
      // 102, // Exeggcute
      103, // Exeggutor
      // 104, // Cubone
      105, // Marowak
      106, // Hitmonlee
      107, // Hitmonchan
      108, // Lickitung
      109, // Koffing
      110, // Weezing
      // 111, // Rhyhorn
      112, // Rhydon
      113, // Chansey
      114, // Tangela
      115, // Kangaskhan
      // 116, // Horsea
      117, // Seadra
      // 118, // Goldeen
      119, // Seaking
      // 120, // Staryu
      // 121, // Starmie
      122, // Mr. Mime
      123, // Scyther
      124, // Jynx
      125, // Electabuzz
      126, // Magmar
      127, // Pinsir
      128, // Tauros
      // 129, // Magikarp
      130, // Gyarados
      131, // Lapras
      132, // Ditto
      // 133, // Eevee
      134, // Vaporeon
      135, // Jolteon
      136, // Flareon
      137, // Porygon
      // 138, // Omanyte
      139, // Omastar
      // 140, // Kabuto
      141, // Kabutops
      142, // Aerodactyl
      143, // Snorlax
      144, // Articuno
      145, // Zapdos
      146, // Moltres
      147, // Dratini
      148, // Dragonair
      149, // Dragonite
      150, // Mewtwo
      151 // Mew
    ];

    this.restoreDefaultRares();
  }

  setRares(rares) {
    this.rares = rares;
  }

  restoreDefaultRares() {
    this.rares = this.defaults;
  }

  get() {
    return this.rares;
  }
}



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
      icon: 'https://raw.githubusercontent.com/ryanburst/pokevision-autoscanner/master/js/icon.png',
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
    this.rarePokemon = new Rares();
    this.scanDelay = 30;
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

    setTimeout(this.scan.bind(this),3000);
  }

  /**
   * Scans for rare pokemon by looking through the DOM for Pokemon icons.
   * Loops through the found Pokemon and compares them to a list of rare
   * pokemon. If the found pokemon is rare, we add a visual indicator
   * and add them to a list so that we can notify the user some were found.
   */
  scan() {
    var pokemonFound = this.findSpecificPokemon();

    // Alert the user of the pokemon that were found
    if(pokemonFound.length){
      this.alert(pokemonFound);
    }

    // Initiates another PokeVision
    $('.home-map-scan').click();

    // Scan again in {this.scanDelay} seconds
    setTimeout(this.scan.bind(this), this.scanDelay * 1000);
  }

  /**
   * Finds specific Pokemon out of all of the pokemon that have already
   * been mapped out by PokeVision
   *
   * @return {Array} Array of Pokemon names
   */
  findSpecificPokemon() {
     // DOM elements representing Pokemon on the map
    var icons = $('.leaflet-marker-icon');
    var rares = [];

    for(var i in icons) {
      // Get the ID from the image source URL
      var regex = /([\w+]+).\w+\s*$/;
      var m = regex.exec(icons[i].src);
      var id = m[1];

      if( this.isRarePokemon(id) ) {
        // Check prevents us from alerting the user to Pokemon
        // that have already been found and classified as "rare"
        if( ! $(icons[i]).hasClass('rare') ) {
          $(icons[i]).addClass('rare');
          rares.push(this.pokedex[id]);
        }
      }
    }

    return rares;
  }

  /**
   * Checks to see if a given ID is within our list of rare Pokemon.
   *
   * @param  {Integer}  id ID of Pokemon
   * @return {Boolean}
   */
  isRarePokemon(id) {
    return this.rarePokemon.get().indexOf(parseInt(id)) > -1;
  }

  /**
   * Alerts the user about rare Pokemon that have been found. Plays
   * a sound to alert them, if they have enabled a sound profile.
   *
   * @param  {Array} rares Pokemon names
   */
  alert(rares) {
    var msg = 'Rare Pokemon found: ' + rares.join(", ");
    if(this.playSounds){
      this.playSound();
      if(this.showAlerts){
        setTimeout(this.messenger.send.bind(this.messenger,msg),100);
      }
    } else if(this.showAlerts){
      this.messenger.send(msg);
    }
  }
}

var scanner = new PokeScan();