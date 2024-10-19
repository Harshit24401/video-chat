"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { firestore } from "@/lib/firebase";
import { getDoc, getFirestore } from "firebase/firestore";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { document } from "postcss";
// Create the context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // Function to get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      console.log("Got media stream:", stream);
      // If you need to attach the stream to a video element, do it here
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });
    webcamVideo.srcObject = localStreamRef.current;
  }, []);

  // Function to create RTC peer connection
  const createPeerConnection = useCallback(() => {
    const servers = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };
    peerConnectionRef.current = new RTCPeerConnection(servers);
    remoteStreamRef.current = new MediaStream();

    // Pull tracks from remote stream, add to video stream
    peerConnectionRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });
    };

    remoteVideo.srcObject = remoteStreamRef.current;
    // Add tracks from local stream to the peer connection
  }, []);

  const callButt = useCallback(async () => {
    const callDoc = await addDoc(collection(firestore, "calls"), {});
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    callInput.value = callDoc.id;
    alert(`the key for the call is ${callInput.value}`);
    console.log(callInput.value);

    // Get candidates for caller, save to db
    peerConnectionRef.current.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    // Listen for remote answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!peerConnectionRef.current.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnectionRef.current.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnectionRef.current.addIceCandidate(candidate);
        }
      });
    });
  }, []);

  const ansButt = useCallback(async () => {
    const callId = callInput.value;
    console.log(callId);
    const callDoc = doc(collection(firestore, "calls"), callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    peerConnectionRef.current.onicecandidate = (event) => {
      event.candidate &&
        setDoc(doc(answerCandidates), event.candidate.toJSON());
    };

    // Fetch data, then set the offer & answer

    const callData = await getDoc(callDoc);
    console.log(callData.data());
    const offerDescription = callData.data().offer;
    console.log(offerDescription);
    const huh = peerConnectionRef.current;
    await huh.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer });

    // Listen to offer candidates

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === "added") {
          let data = change.doc.data();
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    peerConnectionRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });
    };

    remoteVideo.srcObject = remoteStreamRef.current;
  }, []);

  // Add tracks from local stream to the peer connection
  // Handle remote stream
  //peerConnectionRef.current.ontrack = (event) => {
  //const remoteStream = event.streams[0];
  // console.log("Received remote stream:", remoteStream);
  // Attach remote stream to a video element here
  //};

  // ICE candidate handling
  // peerConnectionRef.current.onicecandidate = (event) => {
  //   if (event.candidate) {
  // Send the candidate to the remote peer through your signaling server
  //    console.log("New ICE candidate:", event.candidate);
  //   }
  //  };

  return (
    <AppContext.Provider
      value={{ getUserMedia, createPeerConnection, callButt, ansButt }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
