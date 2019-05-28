var builder = new flatbuffers.Builder(1024);
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
pc.ondatachannel = onDataChannelCallback;
pc.onicegatheringstatechange = onIceGatheringStateChange;
var dc = null;
var cid = Math.floor(Math.random() * 100000);

db.on('child_added', readMsg);

function onIceGatheringStateChange() {
    console.log("Ice gathering state changed:" + pc.iceGatheringState);
    document.getElementById("ice").innerText = pc.iceGatheringState;
}

function onDataChannelCallback(event) {
    dc = event.channel;
    dc.onopen = onDataChannelOpen;
    dc.onclose = onDataChannelClose;
    dc.onmessage = onDataChannelMessage;
}

function readMsg(data) {
    var id = JSON.parse(data.val()).id;
    var content = JSON.parse(data.val()).content;
    console.log(id);
    console.log(content);
    if (id != cid) {
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
		var data = JSON.stringify({id:cid, content:{type:"ice", msg:event.candidate}});
        var msg = db.push(data);
        msg.remove();
    }
}

function onDataChannelOpen() {
    console.log("Data channel opened.");
    document.getElementById("estConn").disabled = true;
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
    //need to parse the message here
    convertToObject(event.data);
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
	createDataChannel();
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => sendOffer());
}

function createDataChannel() {
	dc = pc.createDataChannel("DataChannel"); 
	dc.onopen = onDataChannelOpen;
	dc.onclose = onDataChannelClose;
	dc.onmessage = onDataChannelMessage;
}

function sendOffer() {
    //in the meantime, send offer
    var msg = db.push(JSON.stringify({id:cid, content:{type:"offer", msg: pc.localDescription}}));
    msg.remove();
}


function readOffer(offerSDP) {
    console.log("reading offer:");
    console.log(offerSDP);
    generateAnswer(offerSDP);
}

function generateAnswer(sdp) {
    pc.setRemoteDescription(sdp).then(() => pc.createAnswer()).then(answer => pc.setLocalDescription(answer)).then(() => sendAnswer());
}

function sendAnswer() {
    console.log(JSON.stringify(pc.localDescription));
    var msg = db.push(JSON.stringify({id:cid, content:{type:"answer", msg:pc.localDescription}}));
    msg.remove();
}