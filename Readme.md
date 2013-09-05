WebRTC PeerConnection experiment
===

two-peers-one-page.html is a standalone[µ¥»ú°æ] program simply showing how to start WebRTC peer to peer stream transmission.

Four variables are used to complete the signalling work. (In practice, they should be transported by WebSocket / Socket.io or other way.)
```
var osd2send, // offerer's sdp to send
	asd2send, // answerer's sdp to send
	oice2send, // offerer's icecandidate to send
	aice2send;  // answerer's icecandidate to send
```