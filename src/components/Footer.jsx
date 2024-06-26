import React, { useEffect, useState, useRef } from "react";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import MicIcon from "@mui/icons-material/Mic";
import useSound from "use-sound";
import blip from "../sounds/blip-131856.mp3";
import startbeep from "../sounds/startbeep.mp3";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
// import OpenAI from "openai";
import { useSpeechRecognition } from "react-speech-kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GENAPI_KEY } from "../secrets/apiKey";
import {
  FooterContainer,
  StyledActiveMic,
  StyledBulletIcon,
  StyledInput,
  StyledMic,
  StyledQues,
  StyledSearchButton,
} from "../style/Styled_components";

export default function Footer({ updateChatArray }) {
  const [showMic, setShowMic] = useState(true);
  const [query, setQuery] = useState("");
  // const { speak } = useSpeechSynthesis();
  const [question, setQuestion] = useState("");
  const [micSound, setMicSound] = useState(blip);
  const [apiResponse, setApiResponse] = useState("");
  const [playSound] = useSound(micSound);
  const genAI = new GoogleGenerativeAI(GENAPI_KEY);

  useEffect(() => {
    pushMessage(apiResponse, "ai");
  }, [apiResponse]);

  async function fetchResponse(questionText) {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = questionText;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    setApiResponse(text);
    console.log("The response is ", text);
  }

  const pushMessage = (questionText, typeText) => {
    updateChatArray((oldArray) => {
      return questionText.length === 0
        ? [...oldArray]
        : [
            ...oldArray,
            {
              message: questionText,
              type: typeText,
            },
          ];
    });
  };
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setQuery(result);
    },
    onEnd: () => {
      pushMessage(query, "user");
      if (query !== "") fetchResponse(query);
      setQuery("");
    },
  });
  const handleSearch = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
    }
    pushMessage(question, "user");
    if (question !== "") fetchResponse(question);
    setQuestion("");
  };

  const resetSearch = () => {
    setQuestion("");
  };
  const ref = useRef(null);
  const handleInput = (e, newLine) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      if (e.target.value === "") ref.current.style.height = `${10}px`;
      else if (newLine) ref.current.style.height = `${e.target.scrollHeight}px`;
      else ref.current.style.height = `${e.target.scrollHeight - 16}px`;
    }
  };
  return (
    <>
      <FooterContainer>
        <StyledBulletIcon
          onClick={() => {
            setShowMic(!showMic);
          }}
        >
          {showMic ? (
            <KeyboardIcon htmlColor="white"></KeyboardIcon>
          ) : (
            <MicIcon htmlColor="white"></MicIcon>
          )}
        </StyledBulletIcon>
        {showMic ? (
          listening ? (
            <StyledActiveMic
              onClick={() => {
                stop();
                setMicSound(blip);
                playSound();
              }}
            >
              <MicIcon htmlColor="white" fontSize="inherit"></MicIcon>
            </StyledActiveMic>
          ) : (
            <StyledMic
              onClick={() => {
                try {
                  listen();
                  setMicSound(startbeep);
                  playSound();
                } catch {
                  stop();
                }
              }}
            >
              <MicIcon htmlColor="white" fontSize="inherit"></MicIcon>
            </StyledMic>
          )
        ) : (
          <StyledQues>
            <StyledInput
              placeholder="Type to ask..."
              value={question}
              onKeyDown={(e) => {
                if (e.shiftKey && e.key === "Enter") {
                  setQuestion(question + "\n");
                  handleInput(e, true);
                  e.preventDefault();
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              onChange={(e) => {
                setQuestion(e.target.value);
              }}
              rows = {1}
              ref = {ref}

            ></StyledInput>
            <StyledSearchButton onClick={handleSearch}>
              <SearchIcon fontSize="large" htmlColor="#584d4dd1"></SearchIcon>
            </StyledSearchButton>
          </StyledQues>
        )}

        <StyledBulletIcon onClick={resetSearch}>
          <ClearIcon htmlColor="white"></ClearIcon>
        </StyledBulletIcon>
      </FooterContainer>
    </>
  );
}
