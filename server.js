// Cargamos el modulo IRC, Request y las variables de la configuracion
var irc = require('irc')
  , config = require('./config.json')
  , meetup = require('meetup-api')(config.meetup.apikey);

// Creamos el Cliente para nuestro Bot
var bot = new irc.Client(config.irc.server, config.irc.bot.nick, {
  debug: false,
  channels: [config.irc.channel]
});

// Capturamos los posibles errores en el Bot
bot.addListener('error', function(message) {
  console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

// Capturamos el cierre del canal
bot.addListener('quit', function(message) {
  console.log('Salio: %s: %s', message.command, message.args.join(' '));
});

// Capturamos los mensajes generales, los podemos utilizar para identificar peticiones al Bot
bot.addListener('message', function (from, to, message) {
  console.log('%s => %s: %s', from, to, message);

  // Identifica si se trata de un mensaje en el canal o si es uno privado
  if ( to.match(/^[#&]/) ) {
    
    // Ejemplo de Comando
    if ( message.match(/@hello/i) ) {
      bot.say(to, irc.colors.wrap('orange', 'Hola ' + from + irc.colors.wrap('light_gray', ' (respuesta al comando @hello)')));
    }
    
    if ( message.match(/@meeting/i) ) {
//      bot.say(to, irc.colors.wrap('orange', 'La proxima reunion es: Viernes 19/10 a las 19 hs, lugar a definir.' + irc.colors.wrap('light_gray', ' (respuesta al comando @meeting)')));

      meetup.getEvents({'group_urlname' : config.meetup.groupname}, function(error,response) {
        if (!error) {
          var d = new Date(response.results[0].time+3600000);
          bot.say(to, 'La proxima reunion es "\u0002' + response.results[0].name + '\u0002", el dia \u0002' +  d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear() + '\u0002 a las \u0002' + d.toTimeString() + '\u0002');
          bot.say(to, '\u0002Van a ir ' + response.results[0].yes_rsvp_count + ' miembros \u0002 y \u0002quedan ' + (response.results[0].rsvp_limit - response.results[0].yes_rsvp_count) + ' lugares libres\u0002');
          bot.say(to, '\u0002' + response.results[0].event_url + '\u0002');
        }
      });

    }
    
  } else { // Mensajes privados
    bot.say(from, from + ' me escribiste: "' + irc.colors.wrap('orange', message) + '" por el canal privado.');
  }
});

// Capturamos los mensajes privados que se le envian al Bot
bot.addListener('pm', function(nick, message) {
  console.log('Mensaje privado de %s: %s', nick, message);
});

// Capturamos las uniones al canal
bot.addListener('join', function(channel, who) {
  console.log('%s se ha unido a %s', who, channel);
  bot.say(config.irc.channel, "Bienvenido, " + who + " !!!");
  bot.say(config.irc.channel, irc.colors.wrap('light_gray', 'Podes probar los comando: ') + irc.colors.wrap('orange', '@hello, @meeting, '));
});

// Capturamos la salida de los usuarios del canal
bot.addListener('part', function(channel, who, reason) {
  console.log('%s ha dejado %s: %s', who, channel, reason);
});

// Capturamos las expulsiones del canal
bot.addListener('kick', function(channel, who, by, reason) {
  console.log('%s fue expulsado %s por %s: %s', who, channel, by, reason);
});