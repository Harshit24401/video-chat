"use client";
import { useContext } from "react";
import Image from "next/image";
import WebRTC from "./components/WebRtc";

export default function Home() {
  useContext(() => {
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

    const pc = new RTCPeerConnection(servers);
    let localStream = null;
    let remoteStream = null;
  }, []);
  return (
    <>
      <h1>meow</h1>
      <WebRTC></WebRTC>
    </>
  );
}
