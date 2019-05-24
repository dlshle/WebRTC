var servers = {
    "v": {
        "iceServers": {
            "username": "-wb3IF5eyJkOEzQwOogcbbjr1AhpKuQURjHeiJovt7tK4TY9bcbBHDoCaYdDEbYvAAAAAFzlzo9pbmZvcm1wcm9kdWN0ZGV2ZWxvcG1lbnQ=",
            "urls": [
                "stun:u1.xirsys.com",
                "turn:u1.xirsys.com:80?transport=udp",
                "turn:u1.xirsys.com:3478?transport=udp",
                "turn:u1.xirsys.com:80?transport=tcp",
                "turn:u1.xirsys.com:3478?transport=tcp",
                "turns:u1.xirsys.com:443?transport=tcp",
                "turns:u1.xirsys.com:5349?transport=tcp"
            ],
            "credential": "d2c567fc-7ce1-11e9-907c-f676af1e4042"
        }
    },
    "s": "ok"
};

// Your web app's Firebase configuration
var firebaseConfig = {
	apiKey: "AIzaSyDAuIscNaRHU6RFz4OpEhHE_jqQIeel0UI",
	authDomain: "webrtcsignal.firebaseapp.com",
	databaseURL: "https://webrtcsignal.firebaseio.com",
	projectId: "webrtcsignal",
	storageBucket: "webrtcsignal.appspot.com",
	messagingSenderId: "1044650907446",
	appId: "1:1044650907446:web:326330ca3a719fd2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.database().ref();

var pc = new RTCPeerConnection(servers);
pc.onicecandidate = onIceCandidate;
var dc = pc.createDataChannel("dataChannel");
dc.onopen = onDataChannelOpen;
dc.onclose = onDataChannelClose;
dc.onmessage = onDataChannelMessage;

db.on('child_added', readMsg);

function readMsg(data) {
    var id = JSON.parse(data.val()).id;
    var content = JSON.parse(data.val()).content;
    console.log(id);
    console.log(content);
    if (id != 0) {
        if (content.type == "ice") {
            readICECandidate(content.msg);
        } else if (content.type == "offer") {
            readOffer(content.msg);
        } else if (content.type == "answer") {
            readAnswer(content.msg);
        }
    }
}

function readICECandidate(ice) {
    console.log("accessing ice:");
    console.log(ice);
    pc.addIceCandidate(new RTCIceCandidate(ice)).then(() => console.log("ice candidate added successfully"), () => console.log("error on adding ice candidate"));
}

function onIceCandidate(event) {
    if (event.candidate) {
		var data = JSON.stringify({id:0, content:{type:"ice", msg:event.candidate}});
        var msg = db.push(data);
        msg.remove();
    }
}

function onDataChannelOpen() {
    console.log("Data channel opened.");
    document.getElementById("btnSendMsg").disabled = false;
    document.getElementById("status").innerText = "open";
}

function onDataChannelClose() {
    console.log("Data channel closed.");
    document.getElementById("btnSendMsg").disabled = false;
    document.getElementById("status").innerText = "closed";
    dc.close();
    dc = null;
}

function onDataChannelMessage(event) {
    console.log("Data channel received message:");
    console.log(event.data);
    document.getElementById("message").innerText = JSON.stringify(event.data);
    console.log(JSON.stringify(event.data));
}


//this is where the main transmitting happens
function transmitMessage(data) {
    console.log("sending message...");
    console.log(data);
    dc.send(data);
}

function readAnswer(answerSDP) {
    console.log("reading answer:");
    console.log(answerSDP);
    pc.setRemoteDescription(answerSDP);
}

function createOffer() {
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => sendOffer());
}

function sendOffer() {
    //in the meantime, send offer
    var msg = db.push(JSON.stringify({id:0, content:{type:"offer", msg: pc.localDescription}}));
    msg.remove();
}