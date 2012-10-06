// Cargamos el modulo IRC, Request y las variables de la configuracion
var irc = require('irc')
  ,request = require('request')
  ,config = require('./config.json');

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

// Capturamos los mensajes enviados en un canal especifico
bot.addListener('message' + config.irc.channel, function (from, message) {
  console.log('<%s> %s', from, message);
  bot.say(config.irc.channel, from + ' dijo: ' + message);
  bot.say(config.irc.channel, irc.colors.wrap('light_gray', from + ', por ahora solo repito los mensajes, ya evolucionare, qui si io ...'));
  bot.say(config.irc.channel, irc.colors.wrap('light_gray', 'Podes probar los comando: ') + irc.colors.wrap('orange', '@hello, @meeting, '));
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

      request('https://api.meetup.com/2/events?key='+config.meetup.apikey+'&sign=true&group_urlname='+config.meetup.groupname+'&page=20', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(JSON.parse(body).results[0].name);
          console.log(JSON.parse(body).results[0].description);
          bot.say(to, irc.colors.wrap('orange', 'La proxima reunion es: ' + JSON.parse(body).results[0].name));
          bot.say(to, irc.colors.wrap('orange', JSON.parse(body).results[0].description));
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
});

// Capturamos la salida de los usuarios del canal
bot.addListener('part', function(channel, who, reason) {
  console.log('%s ha dejado %s: %s', who, channel, reason);
});

// Capturamos las expulsiones del canal
bot.addListener('kick', function(channel, who, by, reason) {
  console.log('%s fue expulsado %s por %s: %s', who, channel, by, reason);
});