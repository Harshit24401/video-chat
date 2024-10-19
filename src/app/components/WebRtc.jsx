"use client";
import React from "react";
import { useContext, useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { useAppContext, AppProvider } from "./AppContext.jsx";

const WebRTC = () => {
  const { getUserMedia, createPeerConnection, callButt, ansButt } =
    useAppContext();

  

  return (
    <div>
      <Typography variant="h2">1. Start your Webcam</Typography>
      <div className="videos">
        <Typography variant="h6">Local Stream</Typography>
        <video id="webcamVideo" autoPlay playsInline />
        <Typography variant="h6">Remote Stream</Typography>
        <video id="remoteVideo" autoPlay playsInline />
      </div>
      <Button
        variant="contained"
        color="primary"
        id="webcamButton"
        onClick={createPeerConnection}
      >
        init
      </Button>
      <Button
        variant="contained"
        color="primary"
        id="webcamButton"
        onClick={getUserMedia}
      >
        Start webcam
      </Button>

      <Typography variant="h2">2. Create a new Call</Typography>
      <Button
        variant="contained"
        color="primary"
        id="callButton"
        onClick={callButt}
      >
        Create Call (offer)
      </Button>
      <Typography variant="h2" id="key">
        key
      </Typography>
      <Typography variant="h2">3. Join a Call</Typography>
      <p>Answer the call from a different browser window or device</p>
      <TextField id="callInput" label="Call ID" variant="outlined" fullWidth />
      <Button
        variant="contained"
        color="primary"
        id="answerButton"
        onClick={ansButt}
      >
        Answer
      </Button>
      <Typography variant="h2">4. Hangup</Typography>
      <Button variant="contained" color="primary" id="hangupButton" disabled>
        Hangup
      </Button>
    </div>
  );
};

export default WebRTC;
