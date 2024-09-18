import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    let response;
    try {
      if (prompt !== undefined) {
        // Use provided prompt
        response = await run(prompt);
        setRecentPrompt(prompt);
      } else {
        // Use input if prompt is not defined
        setPrevPrompts((prev) => [...prev, input]);
        setRecentPrompt(input);
        response = await run(input); // Ensure input is passed to run()
      }

      // Ensure the response is a string before splitting
      if (typeof response === "string") {
        let responseArray = response.split("**");
        let newResponse = "";

        for (let i = 0; i < responseArray.length; i++) {
          if (i === 0 || i % 2 !== 1) {
            newResponse += responseArray[i];
          } else {
            newResponse += "<b>" + responseArray[i] + "</b>";
          }
        }

        // Replace '*' with line breaks and handle the result
        let newResponse2 = newResponse.split("*").join("</br>");
        let newResponseArray = newResponse2.split(" ");

        // Process the response with delayPara function
        for (let i = 0; i < newResponseArray.length; i++) {
          const nextWord = newResponseArray[i];
          delayPara(i, nextWord + " ");
        }

        setLoading(false);
        setInput(""); // Clear input after sending
      } else {
        console.error("Invalid response type. Expected a string.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in onSent function:", error);
      setLoading(false); // Ensure loading is disabled on error
    }
  };
  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
