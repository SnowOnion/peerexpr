/* FormatYXY 20130905 11:30
 * 
 * request sent to server:
 * request=
 * {
 *   type:"rtc",
 *   value:stringify({
 *      type:"OFFER" / "ANSWER" / "ICE"
 *      value: <offersdp> / <answersdp> / <icecandidate>
 *   })
 * }
 * 
 * server respond:
 * respond=
 * request.value=
 * stringify({
 *      type:"OFFER" / "ANSWER" / "ICE"
 *      value: <offersdp> / <answersdp> / <icecandidate>
 *   })
 */

function PeerPlugPlay() {
    
    

    // For Debug
    function displayProp(obj) {
        var names = "";
        for (var name in obj) {
            if (typeof obj[name] == "object") {
                names += displayProp(obj[name]);
            }
            else
            {
                names += name + ": " + obj[name] + " | ";
            }
        }
        return names;
    }

    window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var aele = "Audio dom of beater";////

    var osd2send,
            asd2send,
            ice2send;

    var sock;////

    var rpc = new PeerConnection({iceServers: [{url: 'stun:stun.l.google.com:19302'}]});

    rpc.onicecandidate = function(evt) {
        if (!rpc || !evt || !evt.candidate) {
            console.log('wrong when rpc.onicecandidate');
            return;
        }
        ice2send = JSON.stringify({
            type: 'rtc',
            value: JSON.stringify({
                type: 'ICE',
                value: evt.candidate
            })
        });
        sock.send(ice2send);
    };

    if (SOCK_IS_SINGER) {////
        sock.onmessage = function(evt) {

            console.log("AS SINGER: " + evt.data);

            var par = JSON.parse(evt.data);

            if (par.type == 'ANSWER') {
                rpc.setRemoteDescription(new RTCSessionDescription(par.value), function() {
                    console.log('sdp exchange complete');
                })
            }
            else if (par.type == 'ICE') {
                rpc.addIceCandidate(new RTCIceCandidate(par.value));
            }
            else {
                console.log('unknown response');
            }
        };

        navigator.getUserMedia({video: true, audio: true},
        function(localStream) {
            var url = window.URL.createObjectURL(localStream);
            vele.src = url || localStream;

            rpc.addStream(localStream);

            rpc.createOffer(
                    function(osd) {
                        rpc.setLocalDescription(osd, function() {
                            // inner type for my identifying, outer type for server identifying
                            osd2send = JSON.stringify({
                                type: 'rtc',
                                value: JSON.stringify({
                                    type: 'OFFER',
                                    value: osd
                                })
                            });
                            sock.send(osd2send);
                        });
                    },
                    null,
                    {'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true}}
            );

        },
                function(err) {
                    console.log(err);
                });

    }
    else { // IS_BEATER ////
        sock.onmessage = function(evt) {

            console.log("AS BEATER: " + evt.data);

            var par = JSON.parse(evt.data);
            if (par.type == 'OFFER') {
                rpc.setRemoteDescription(new RTCSessionDescription(par.value), function() {
                    rpc.createAnswer(
                            function(asd) {
                                rpc.setLocalDescription(asd, function() {
                                    asd2send = JSON.stringify({
                                        type: 'rtc',
                                        value: JSON.stringify({
                                            type: 'ANSWER',
                                            value: asd
                                        })
                                    });
                                    ws2.send(asd2send);
                                });
                            }
                    );
                });
            }
            else if (par.type == 'ICE') {
                rpc.addIceCandidate(new RTCIceCandidate(par.value));
            }
            else {
                console.log('unknown response');
            }
        };

        rpc.onaddstream = function(evt) {
            if (!rpc || !evt || !evt.stream) {
                console.log('wrong when rpc2.onaddstream');
                return;
            }
            var url = window.URL.createObjectURL(evt.stream);
            aele.src = url || evt.stream; ////
        };
    }
    
    
}
