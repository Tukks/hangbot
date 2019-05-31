    const Fs = require('fs');
    const Path = require('path');
    const Winston = require('winston');
    const Discord = require('discord.js');
    const Tools = require('./tools.js')
    const request = require('request');
    const async = require("async");
    let moment = require("moment");
    let momentTz = require("moment-timezone");
    const HtmlParser = require('htmlparser2');
    const Https = require('https');
    const {URL} = require('url');
    var auth;


    /**Two provider
     * https://www.geonames.org/export/ws-overview.html
     * &&
     * https://openweathermap.org/appid
     *
     * @type {string}KK
     */
    GEONAME_API_URL = "http://api.geonames.org/";
    GEONAME_API_TIMEZONE = "timezoneJSON";
    GEONAME_API_WEATHER = "weatherJSON";
    GEONAME_API_USERNAME = "hangbot";
    GEONAME_API_NCE_LONG = "7.1827776";
    GEONAME_API_NCE_LAT = "43.7031691";
    GEONAME_API_YQB_LONG = "-71.6218679";
    GEONAME_API_YQB_LAT = "46.8560266";
    GEONAME_API_NOU_LONG = "-22.2643536";
    GEONAME_API_NOU_LAT = "166.4098473";
    GEONAME_API_ICAO_NOU_CODE = "NWWW";
    GEONAME_API_ICAO_NCE_CODE = "LFMN";
    GEONAME_API_ICAO_YQB_CODE = "CYQB";

    NICO_TAG = "Ferreyd";
    JEREMY_TAG = "rajaoje";
    GIUSEPPE_TAG = "Giuseppe";
    DAMIEN_TAG = "Damien";
    MARC_TAG = "Cocosesame";
    NADEGE_TAG = "Nadège";
    IMAN_TAG = "Iman";
    WILLIAM_TAG = "Shuny";
    LAURENT_TAG = "iko";


    const startup = () => {
        Winston.log('info', 'Starting up...');

        const bot = new Discord.Client();
        let isInit = false;

        const init = () => {
            isInit = true;
        };

        bot.on('ready', () => {
            Winston.log('info', 'I\'m connected to the Discord network!');
            Winston.log('info', bot.user.username);
            Winston.log('info',"Tring to get Youtube API Key");
            // Load client secrets from a local file.
            auth = Tools.retrieveToken();


            // Properly close connection on Ctrl-C
            process.on('SIGINT', () => {
                Winston.log('info', 'Shutting down...');
                bot.destroy().then(() => process.exit());
            });

            if (!isInit)
                init();
        });


        // Respond to messages
        bot.on('message', msg => {
            // Make sure we de not reply to our own messages
            if (msg.author.id === bot.user.id) return;
            if (msg.content != null) {
                if (msg.content === '!heure') {
                    heure_command(bot, msg);
                } else if (msg.content.includes('!heureWs')) {
                    heure_command_ws(bot, msg);
                } else if (msg.content.includes('!issue')) {
                    msg.reply('https://github.com/Ferreyd/hangbot/issues');
                } else if (msg.content.includes('!github')) {
                    msg.reply('https://github.com/Ferreyd/hangbot');
                } else if (msg.content.includes('!help')) {
                    msg.reply("\n!heure\n!issue\n!github\n!help\n!bonjour\n!weekend\n!jour\n!bigflo\n");
                } else if (msg.content.includes('!jour')) {
                    jour_command(bot, msg);
                } else if (msg.content.includes('!weekend')) {
                    weekend_command(bot, msg);
                } else if (msg.content.includes('!bonjour')) {
                    bonjour_command(bot, msg);
                }  else if(msg.content.includes('!bigflo')) {
                    bigfloAndOliCommand(bot,msg);
                } else {
                    return;
                }
            }
        });

        // Connect from the token found in the .token file
        Fs.readFile('.token', {encoding: 'utf-8'}, (err, data) => {
            if (err == null)
                bot.login(data.trimRight());
            else
                Winston.log('error', err.message);
        });
    };

    startup();

    const heure_command_ws = (bot, msg) => {
        var message;
        var nce = "";
        var nou = "";
        var yqb = "";
        var msgNce = "";
        var msgNou = "";
        var msgYqb = "";

        const tasks = [
            //http://api.geonames.org/timezoneJSON?formatted=true&lat=47.01&lng=10.2&username=demo&style=full
            request.get(GEONAME_API_URL + GEONAME_API_TIMEZONE + "?formated=true&lat=" + GEONAME_API_NCE_LAT + "&lng=" + GEONAME_API_NCE_LONG + "&username=" + GEONAME_API_USERNAME + "&style=full", (error, response, body) => {
                if (error) {
                    return Winston.log('error', "error on NCE : " + error);
                }
                nce = JSON.parse(body);
                msgNce += "Nice : heure : " + nce.time;
            }),
            request.get(GEONAME_API_URL + GEONAME_API_TIMEZONE + "?formated=true&lat=" + GEONAME_API_NOU_LAT + "&lng=" + GEONAME_API_NOU_LONG + "&username=" + GEONAME_API_USERNAME + "&style=full", (error, response, body) => {
                if (error) {
                    return Winston.log('error', "error on NOU : " + error);
                }
                nou = JSON.parse(body);
                msgNou += "Nouméa : heure : " + nou.time;
            }),

            request.get(GEONAME_API_URL + GEONAME_API_TIMEZONE + "?formated=true&lat=" + GEONAME_API_NCE_LAT + "&lng=" + GEONAME_API_YQB_LONG + "&username=" + GEONAME_API_USERNAME + "&style=full", (error, response, body) => {
                if (error) {
                    return Winston.log('error', "error on YQB : " + error);
                }
                yqb = JSON.parse(body);
                msgYqb += "Quebec : heure : " + yqb.time;
            })
        ];

        async.series(tasks, (err, results) => {
            if (err) {
                return next(err);
            } else {
                message = msgNce + "\n" + msgNou + "\n" + msgYqb;
                msg.reply(message);
                return;
            }
        })


    };
    const heure_command = (bot, msg) => {
        moment.locale('fr');
        let now = moment();

        let nice = now.tz('Europe/Paris').format("LLLL");
        let noumea = now.tz('Pacific/Noumea').format("LLLL");
        let quebec = now.tz('America/Montreal').format("LLLL");

        let message = "\nNice : " + nice + "\nNoumea : " + noumea + "\nQuebec : " + quebec;

        msg.reply(message);

    };
    const bonjour_command = (bot, msg) => {
        msg.reply("Bonjour, comment ça va aujourd'hui ?");
    };
    const jour_command = (bot, msg) => {
        let userTag = msg.author.username;
        Winston.log('log', "User is " + userTag);
        moment.locale('fr');
        if (NICO_TAG === userTag) {
            msg.reply("\n" + moment("17:00", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera l'heure de la liberté, camarade @" + userTag + " , courage !!");
        }
        else if (JEREMY_TAG === userTag) {
            msg.reply("\n tabernacle" + moment("16:00", "HH:mm").tz('America/Montreal').fromNow() + " ce sera ta fin de journée carisse," +
                " prend ton char et vas t'en @" + userTag + " , et vive Céline");
        }
        else if (GIUSEPPE_TAG === userTag) {
            msg.reply(" Tu es en vacance feignasse.");
        }
        else if (IMAN_TAG === userTag) {
            msg.reply("\n" + moment("16:00", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera ta fin de journée @" + userTag + " , courage !!");
        }
        else if (DAMIEN_TAG === userTag) {
            msg.reply("\n" + moment("17:00", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera l'heure de remonter de la mine @" + userTag + " !!");
        }
        else if (MARC_TAG === userTag) {
            msg.reply("\n" + moment("17:30", "HH:mm").tz('Europe/Paris').fromNow() + " tu pourras arreter de rien fouttre au taff pour rien branler chez toi, bravo @ " + userTag)
        }
        else if (WILLIAM_TAG === userTag) {
            msg.reply("\n" + moment("17:30", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera ta fin de journée @" + userTag + " , courage !!");
        }
        else if (NADEGE_TAG === userTag) {
            msg.reply("\n" + moment("19:00", "HH:mm").tz('Europe/Paris').fromNow() + " tu pourras dépenser tes tickets resto au bar @" + userTag + " , alcoolique !!");
        }
        else {
            msg.reply("\n" + moment("17:30", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera ta fin de journée @" + userTag + " , courage !!")
        }
    };

    const weekend_command = (bot, msg) => {
        msg.reply("\nPas encore implémenté, patience !");
    };


    function HttpsGet(url, callback) {
        // Need an URL object
        if (typeof(url) === typeof(''))
            url = new URL(url);

        return Https.get({
            hostname: url.hostname,
            path: url.pathname + url.search,
            headers: {
                'User-Agent': 'Hangbot/1.0.0'
            }
        }, result => {
            result.setEncoding('utf8');

            let htmlBody = '';
            result.on('data', data => htmlBody += data);
            result.on('end', () => {
                callback(htmlBody);
            });
        });
    }

    /**
     * This command send a random video with @louckousse tagged from notorious french artist Big Flo and Oli
     * The idea is to take the playlist and randomly extract one video from it and display it.
     * @param {} bot 
     * @param {*} msg 
     */
    const bigfloAndOliCommand = (bot, msg) => {
        var promise = Tools.callPlaylist(auth); 
        promise.then(function(result) {
            var channels = result.data.items;
            if (channels.length == 0) {
                console.log('No channel found.');
            } else {
                var lck = bot.users.get("186800747856265219");
                bot.channels.get(msg.channel.id).send(Tools.managePlayListResponse(channels,lck));
            }}, function(err){
                msg.reply("Malheuresement ca marche pas ;(")
                console.log(err);
            });    
    }

