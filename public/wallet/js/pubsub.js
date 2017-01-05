var pubnub
var pubsub = {}
pubnub = initPubNub(pubsub.identity)
pubsub.identity = getIdentity
pubsub.subscribePubSubChannel = subscribe
pubsub.publishPubSubChannel = publish
pubsub.subscribeBlockchains = subscribeBlockchains
pubsub.pubnub = pubnub

function PubSub() {
    return pubsub
}

function subscribe(address) {
    pubnub.subscribe({
        channel: address,
        message: function(message, env, channel) {
            popMsg(JSON.stringify(message))
        },
        connect: pub(address)
    })
}

function pub(channel) {
    pubnub.publish({
        channel: channel,
        message: "Joined Channel: " + channel,
        callback: function(m) {
            console.log("m: " + m)
        }
    })
}

function publish(msg, channel) {
    pubnub.publish({
        channel: channel,
        message: msg,
        callback: function (m) {
            console.log("m: " + m)
        }
    })
}

function getIdentity(addy) {
    var hdkey
    try {
        hdkey = bitcore.HDPrivateKey(JSON.parse(addy).xprivkey)
    } catch (e) {
        hdkey = bitcore.HDPrivateKey(addy.xprivkey)
    }
    var address = hdkey.privateKey.toAddress().toString()
    return address
}

function initPubNub(uuid){
    var pubnub = PUBNUB.init({
            //publish_key: 'pub-c-bdf47ac2-b687-4918-a720-bb2d3a1b204f',
            //subscribe_key: 'sub-c-360460ce-eca5-11e4-aafa-0619f8945a4f',
            publish_key: 'demo',
            subscribe_key: 'demo',
            uuid: JSON.stringify({"uuid": uuid, "name": $("#displayName").val()})
        })
        return pubnub
}

function subscribeBlockchains(){
    var eventsToListenTo = ['tx','block']
    var room = 'inv'
    $(bitcore.Networks.AvailableNetworks).each(function (index, element) {
        var api = element.insight.url
        var name = element.name
        if (api.indexOf('test') === -1 && api.indexOf('frankos') === -1) {
            var socket
            if (api.indexOf('.info') > -1 || api.indexOf('.com') > -1) {
                socket = io(api + ":443");
            } else {
                socket = io(api);
            }
            
            socket.on('connect', function () {
                socket.emit('subscribe', room);
            })

            $(eventsToListenTo).each(function (index, value) {
                var eventToListenTo = eventsToListenTo[index]
                socket.on(eventToListenTo, function (data) {
                    var msg = name+" Blockchain registered new " + eventToListenTo + ": " + JSON.stringify(data)
                    if (verbose) { console.log(msg) }
                    meshnet.issueCommand("blockchain", { chain: name, type: eventToListenTo, payload: data })
                })
            })
            
        }
    })
    
}